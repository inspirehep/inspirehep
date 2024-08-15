/* eslint-disable no-underscore-dangle */
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';
import axios from 'axios';

import { httpErrorToActionPayload } from '../common/utils';
import {
  BACKOFFICE_LOGIN_ERROR,
  BACKOFFICE_LOGIN_SUCCESS,
  BACKOFFICE_LOGOUT_SUCCESS,
  BACKOFFICE_SEARCH_REQUEST,
  BACKOFFICE_SEARCH_ERROR,
  BACKOFFICE_SEARCH_SUCCESS,
  BACKOFFICE_SEARCH_QUERY_UPDATE,
  BACKOFFICE_AUTHOR_ERROR,
  BACKOFFICE_AUTHOR_REQUEST,
  BACKOFFICE_AUTHOR_SUCCESS,
  BACKOFFICE_SEARCH_QUERY_RESET,
  BACKOFFICE_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_RESOLVE_ACTION_SUCCESS,
  BACKOFFICE_RESOLVE_ACTION_ERROR,
  BACKOFFICE_LOGIN_CHECK,
  BACKOFFICE_LOGIN_REQUEST,
  BACKOFFICE_DELETE_SUCCESS,
  BACKOFFICE_DELETE_ERROR,
  BACKOFFICE_DELETE_REQUEST,
} from './actionTypes';
import {
  BACKOFFICE_API,
  BACKOFFICE_LOGIN_API,
  BACKOFFICE_SEARCH_API,
  BACKOFFICE,
  BACKOFFICE_LOGIN,
  BACKOFFICE_SEARCH,
  BACKOFFICE_LOGIN_ORCID,
} from '../common/routes';
import { Credentials } from '../types';
import storage from '../common/storage';
import {
  notifyLoginError,
  notifyActionError,
  notifyActionSuccess,
  notifyDeleteSuccess,
  notifyDeleteError,
} from '../backoffice/notifications';
import { refreshToken } from '../backoffice/utils/utils';

const httpClient = axios.create();

// Request interceptor for API calls
httpClient.interceptors.request.use(
  async (config) => {
    const token = storage.getSync('backoffice.token');

    config.headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for API calls
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (
        error.response?.status === 403 &&
        (!(error.config as any)._retry as boolean)
      ) {
        (error.config as any)._retry = true;
        try {
          const accessToken = await refreshToken();
          axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          return httpClient(error.config!);
        } catch (tokenError) {
          return Promise.reject(tokenError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// LOGIN ACTIONS
function checkForLogin() {
  return {
    type: BACKOFFICE_LOGIN_CHECK,
  };
}

export function backofficeLoginSuccess() {
  return {
    type: BACKOFFICE_LOGIN_SUCCESS,
  };
}

function backofficeLoginError(error: { error: Error }) {
  return {
    type: BACKOFFICE_LOGIN_ERROR,
    payload: error,
  };
}

function backofficeLogoutSuccess() {
  return {
    type: BACKOFFICE_LOGOUT_SUCCESS,
  };
}

export function backofficeLocalLogin(
  credentials: Credentials
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch({ type: BACKOFFICE_LOGIN_REQUEST });
    try {
      const response = await httpClient.post(
        BACKOFFICE_LOGIN_API,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const { access, refresh } = await response.data;
        storage.set('backoffice.token', access);
        storage.set('backoffice.refreshToken', refresh);

        dispatch(backofficeLoginSuccess());
        dispatch(push(BACKOFFICE));
      }
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      notifyLoginError(error?.detail);
      dispatch(backofficeLoginError({ error }));
    }
  };
}

export function backofficeLogin(): (
  dispatch: ActionCreator<Action>
) => Promise<void> {
  return async (dispatch) => {
    dispatch({ type: BACKOFFICE_LOGIN_REQUEST });
    try {
      const response = await httpClient.post(BACKOFFICE_LOGIN_ORCID);

      if (response.status === 200) {
        // TODO: how to authorise requests without token?

        dispatch(backofficeLoginSuccess());
      }
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      notifyLoginError(error?.detail);
      dispatch(backofficeLoginError({ error }));
    }
  };
}

export function backofficeLogout(): (
  dispatch: ActionCreator<Action>
) => Promise<void> {
  return async (dispatch) => {
    try {
      storage.remove('backoffice.token');
      storage.remove('backoffice.refreshToken');

      dispatch(backofficeLogoutSuccess());
      dispatch(push(BACKOFFICE_LOGIN));
    } catch (error) {
      dispatch(backofficeLogoutSuccess());
    }
  };
}

// SEARCH ACTIONS
function searching() {
  return {
    type: BACKOFFICE_SEARCH_REQUEST,
  };
}

function searchSuccess(data: any) {
  return {
    type: BACKOFFICE_SEARCH_SUCCESS,
    payload: { data },
  };
}

function searchError(errorPayload: { error: Error }) {
  return {
    type: BACKOFFICE_SEARCH_ERROR,
    payload: { ...errorPayload },
  };
}

function updateQuery(data: any) {
  return {
    type: BACKOFFICE_SEARCH_QUERY_UPDATE,
    payload: data,
  };
}

function resetQuery() {
  return {
    type: BACKOFFICE_SEARCH_QUERY_RESET,
  };
}

type QueryParams = {
  page: number;
  size?: number;
  ordering?: string;
  [key: string]: any;
};
export function searchQueryUpdate(
  query: QueryParams
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(updateQuery(query));
  };
}

export function searchQueryReset(): (
  dispatch: ActionCreator<Action>
) => Promise<void> {
  return async (dispatch) => {
    dispatch(resetQuery());
  };
}

export function fetchSearchResults(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny
) => Promise<void> {
  return async (dispatch, getState) => {
    dispatch(searching());

    const currentQuery = getState()?.backoffice?.get('query')?.toJS() || {};
    const resolveQuery = `${BACKOFFICE_SEARCH_API}/?${
      Object.entries(currentQuery)
        .filter(([_, value]) => value != null && value !== '')
        .map(([key, value]: [string, any]) => `${key}=${value}`)
        .join('&') || ''
    }`;

    try {
      const response = await httpClient.get(`${resolveQuery}`);
      dispatch(searchSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(searchError(error));
    }
  };
}

// AUTHOR ACTIONS
function fetchingAuthor() {
  return {
    type: BACKOFFICE_AUTHOR_REQUEST,
  };
}

function fetchAuthorSuccess(data: any) {
  return {
    type: BACKOFFICE_AUTHOR_SUCCESS,
    payload: { data },
  };
}

function fetchAuthorError(errorPayload: { error: Error }) {
  return {
    type: BACKOFFICE_AUTHOR_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthor(
  id: string
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(fetchingAuthor());
    const resolveQuery = `${BACKOFFICE_API}/workflows/authors/${id}`;

    try {
      const response = await httpClient.get(`${resolveQuery}`);
      dispatch(fetchAuthorSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchAuthorError(error));
    }
  };
}

// DECISSION ACTIONS
function resolvingAction(type: string) {
  return {
    type: BACKOFFICE_RESOLVE_ACTION_REQUEST,
    payload: { type },
  };
}

function resolveActionSuccess() {
  return {
    type: BACKOFFICE_RESOLVE_ACTION_SUCCESS,
  };
}

function resolveActionError(errorPayload: { error: Error }) {
  return {
    type: BACKOFFICE_RESOLVE_ACTION_ERROR,
    payload: { ...errorPayload },
  };
}

export function resolveAction(
  id: string,
  action: string,
  payload: any
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(resolvingAction(action));
    try {
      const response = await httpClient.post(
        `${BACKOFFICE_API}/workflows/authors/${id}/${action}/`,
        payload
      );

      dispatch(resolveActionSuccess());
      notifyActionSuccess(action);
      dispatch(fetchAuthorSuccess(response.data));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      notifyActionError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.detail) || 'An error occurred'
      );
      dispatch(resolveActionError(error));
    }
  };
}

// DELETE ACTIONS

export const deletingWorkflow = () => {
  return {
    type: BACKOFFICE_DELETE_REQUEST,
  };
};

export const deleteWorkflowSuccess = () => {
  return {
    type: BACKOFFICE_DELETE_SUCCESS,
  };
};

export const deleteWorkflowError = (errorPayload: { error: Error }) => {
  return {
    type: BACKOFFICE_DELETE_ERROR,
    payload: { ...errorPayload },
  };
};

export function deleteWorkflow(
  id: string
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(deletingWorkflow());
    try {
      await httpClient.delete(`${BACKOFFICE_API}/workflows/authors/${id}/`);

      dispatch(deleteWorkflowSuccess());
      notifyDeleteSuccess();
      dispatch(push(BACKOFFICE_SEARCH));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);

      dispatch(deleteWorkflowError(error));
      notifyDeleteError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.detail) || 'An error occurred'
      );
    }
  };
}

export function isUserLoggedInToBackoffice(): (
  dispatch: ActionCreator<Action>
) => Promise<void> {
  return async (dispatch) => {
    dispatch(checkForLogin());
    try {
      const response = await httpClient.get(
        'https://backoffice.dev.inspirebeta.net/api/_allauth/browser/v1/auth/session'
      );

      if (response.status === 200) {
        dispatch(searchQueryReset());
        dispatch(fetchSearchResults());
      }
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      notifyLoginError(error?.detail);
      dispatch(backofficeLoginError({ error }));
      dispatch(push(BACKOFFICE_LOGIN));
    }
  };
}
