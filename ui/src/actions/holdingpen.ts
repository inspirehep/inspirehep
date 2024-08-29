/* eslint-disable no-underscore-dangle */
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';
import axios from 'axios';

import { httpErrorToActionPayload } from '../common/utils';
import {
  HOLDINGPEN_LOGIN_ERROR,
  HOLDINGPEN_LOGIN_SUCCESS,
  HOLDINGPEN_LOGOUT_SUCCESS,
  HOLDINGPEN_SEARCH_REQUEST,
  HOLDINGPEN_SEARCH_ERROR,
  HOLDINGPEN_SEARCH_SUCCESS,
  HOLDINGPEN_SEARCH_QUERY_UPDATE,
  HOLDINGPEN_AUTHOR_ERROR,
  HOLDINGPEN_AUTHOR_REQUEST,
  HOLDINGPEN_AUTHOR_SUCCESS,
  HOLDINGPEN_SEARCH_QUERY_RESET,
  HOLDINGPEN_RESOLVE_ACTION_REQUEST,
  HOLDINGPEN_RESOLVE_ACTION_SUCCESS,
  HOLDINGPEN_RESOLVE_ACTION_ERROR,
  HOLDINGPEN_LOGIN_REQUEST,
  HOLDINGPEN_DELETE_SUCCESS,
  HOLDINGPEN_DELETE_ERROR,
  HOLDINGPEN_DELETE_REQUEST,
} from './actionTypes';
import {
  BACKOFFICE_API,
  BACKOFFICE_LOGIN,
  BACKOFFICE_SEARCH_API,
  HOLDINGPEN_NEW,
  HOLDINGPEN_LOGIN_NEW,
  HOLDINGPEN_SEARCH_NEW,
} from '../common/routes';
import { Credentials } from '../types';
import storage from '../common/storage';
import {
  notifyLoginError,
  notifyActionError,
  notifyActionSuccess,
  notifyDeleteSuccess,
  notifyDeleteError,
} from '../holdingpen-new/notifications';
import { refreshToken } from '../holdingpen-new/utils/utils';

const httpClient = axios.create();

// Request interceptor for API calls
httpClient.interceptors.request.use(
  async (config) => {
    const token = storage.getSync('holdingpen.token');

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
export function holdingpenLoginSuccess() {
  return {
    type: HOLDINGPEN_LOGIN_SUCCESS,
  };
}

function holdingpenLoginError(error: { error: Error }) {
  return {
    type: HOLDINGPEN_LOGIN_ERROR,
    payload: error,
  };
}

function holdingpenLogoutSuccess() {
  return {
    type: HOLDINGPEN_LOGOUT_SUCCESS,
  };
}

export function holdingpenLogin(
  credentials: Credentials
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch({ type: HOLDINGPEN_LOGIN_REQUEST });
    try {
      const response = await httpClient.post(
        BACKOFFICE_LOGIN,
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
        storage.set('holdingpen.token', access);
        storage.set('holdingpen.refreshToken', refresh);

        dispatch(holdingpenLoginSuccess());
        dispatch(push(HOLDINGPEN_NEW));
      }
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      notifyLoginError(error?.detail);
      dispatch(holdingpenLoginError({ error }));
    }
  };
}

export function holdingpenLogout(): (
  dispatch: ActionCreator<Action>
) => Promise<void> {
  return async (dispatch) => {
    try {
      storage.remove('holdingpen.token');
      storage.remove('holdingpen.refreshToken');

      dispatch(holdingpenLogoutSuccess());
      dispatch(push(HOLDINGPEN_LOGIN_NEW));
    } catch (error) {
      dispatch(holdingpenLogoutSuccess());
    }
  };
}

// SEARCH ACTIONS
function searching() {
  return {
    type: HOLDINGPEN_SEARCH_REQUEST,
  };
}

function searchSuccess(data: any) {
  return {
    type: HOLDINGPEN_SEARCH_SUCCESS,
    payload: { data },
  };
}

function searchError(errorPayload: { error: Error }) {
  return {
    type: HOLDINGPEN_SEARCH_ERROR,
    payload: { ...errorPayload },
  };
}

function updateQuery(data: any) {
  return {
    type: HOLDINGPEN_SEARCH_QUERY_UPDATE,
    payload: data,
  };
}

function resetQuery() {
  return {
    type: HOLDINGPEN_SEARCH_QUERY_RESET,
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

    const currentQuery = getState()?.holdingpen?.get('query')?.toJS() || {};
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
    type: HOLDINGPEN_AUTHOR_REQUEST,
  };
}

function fetchAuthorSuccess(data: any) {
  return {
    type: HOLDINGPEN_AUTHOR_SUCCESS,
    payload: { data },
  };
}

function fetchAuthorError(errorPayload: { error: Error }) {
  return {
    type: HOLDINGPEN_AUTHOR_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthor(
  id: string
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(fetchingAuthor());
    const resolveQuery = `${BACKOFFICE_API}/${id}`;

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
    type: HOLDINGPEN_RESOLVE_ACTION_REQUEST,
    payload: { type },
  };
}

function resolveActionSuccess() {
  return {
    type: HOLDINGPEN_RESOLVE_ACTION_SUCCESS,
  };
}

function resolveActionError(errorPayload: { error: Error }) {
  return {
    type: HOLDINGPEN_RESOLVE_ACTION_ERROR,
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
        `${BACKOFFICE_API}/authors/${id}/${action}/`,
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
    type: HOLDINGPEN_DELETE_REQUEST,
  };
};

export const deleteWorkflowSuccess = () => {
  return {
    type: HOLDINGPEN_DELETE_SUCCESS,
  };
};

export const deleteWorkflowError = (errorPayload: { error: Error }) => {
  return {
    type: HOLDINGPEN_DELETE_ERROR,
    payload: { ...errorPayload },
  };
};

export function deleteWorkflow(
  id: string
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(deletingWorkflow());
    try {
      await httpClient.delete(`${BACKOFFICE_API}/${id}/`);

      dispatch(deleteWorkflowSuccess());
      notifyDeleteSuccess();
      dispatch(push(HOLDINGPEN_SEARCH_NEW));
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
