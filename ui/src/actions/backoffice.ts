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
  BACKOFFICE_AUTHORS_DASHBOARD_ERROR,
  BACKOFFICE_AUTHORS_DASHBOARD_REQUEST,
  BACKOFFICE_AUTHORS_DASHBOARD_SUCCESS,
  BACKOFFICE_LITERATURE_DASHBOARD_ERROR,
  BACKOFFICE_LITERATURE_DASHBOARD_REQUEST,
  BACKOFFICE_LITERATURE_DASHBOARD_SUCCESS,
  BACKOFFICE_LITERATURE_REQUEST,
  BACKOFFICE_LITERATURE_SUCCESS,
  BACKOFFICE_LITERATURE_ERROR,
} from './actionTypes';
import {
  BACKOFFICE_API,
  BACKOFFICE_LOGIN_API,
  BACKOFFICE,
  BACKOFFICE_LOGIN,
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
import { getConfigFor } from '../common/config';

// withCredentials is needed for ORCID login with sessionId cookie
const httpClient = axios.create({ withCredentials: true });

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

// Response interceptor for API calls, needed for local login with token
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

export function backofficeLogout(): (
  dispatch: ActionCreator<Action>
) => Promise<void> {
  return async (dispatch) => {
    try {
      storage.remove('backoffice.token');
      storage.remove('backoffice.refreshToken');

      await httpClient.get(`${BACKOFFICE_API}/users/logout/`);

      dispatch(backofficeLogoutSuccess());
      dispatch(push(BACKOFFICE_LOGIN));
    } catch (error) {
      dispatch(backofficeLogoutSuccess());
    }
  };
}

// DASHBOARD ACTIONS
function fetchAuthorsDashboardInfo(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny
) => Promise<void> {
  return async (dispatch) => {
    dispatch({ type: BACKOFFICE_AUTHORS_DASHBOARD_REQUEST });
    try {
      const response = await httpClient.get(
        `${BACKOFFICE_API}/workflows/authors/search`
      );
      dispatch({
        type: BACKOFFICE_AUTHORS_DASHBOARD_SUCCESS,
        payload: response.data.facets,
      });
    } catch (error) {
      dispatch({ type: BACKOFFICE_AUTHORS_DASHBOARD_ERROR, payload: error });
    }
  };
}

function fetchLiteratureDashboardInfo(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny
) => Promise<void> {
  return async (dispatch) => {
    dispatch({ type: BACKOFFICE_LITERATURE_DASHBOARD_REQUEST });
    try {
      const response = await httpClient.get(
        `${BACKOFFICE_API}/workflows/hep/search`
      );
      dispatch({
        type: BACKOFFICE_LITERATURE_DASHBOARD_SUCCESS,
        payload: response.data.facets,
      });
    } catch (error) {
      dispatch({ type: BACKOFFICE_LITERATURE_DASHBOARD_ERROR, payload: error });
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

export function fetchSearchResults(
  namespace: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny
) => Promise<void> {
  return async (dispatch, getState) => {
    dispatch(searching());

    const currentQuery = getState()?.backoffice?.get('query')?.toJS() || {};
    const resolveQuery = `${`${BACKOFFICE_API}/workflows/${namespace}/search`}/?${
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

// LITERATURE ACTIONS
function fetchingLiteratureRecord() {
  return {
    type: BACKOFFICE_LITERATURE_REQUEST,
  };
}

function fetchLiteratureRecordSuccess(data: any) {
  return {
    type: BACKOFFICE_LITERATURE_SUCCESS,
    payload: { data },
  };
}

function fetchLiteratureRecordError(errorPayload: { error: Error }) {
  return {
    type: BACKOFFICE_LITERATURE_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchLiteratureRecord(
  id: string
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(fetchingLiteratureRecord());
    const resolveQuery = `${BACKOFFICE_API}/workflows/hep/${id}`;

    try {
      const response = await httpClient.get(`${resolveQuery}`);
      dispatch(fetchLiteratureRecordSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchLiteratureRecordError(error));
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
      dispatch(push(`${BACKOFFICE}/authors/search`));
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
      const response = await httpClient.get(`${BACKOFFICE_API}/users/me/`);

      if (response.status === 200) {
        dispatch(searchQueryReset());
        dispatch(fetchAuthorsDashboardInfo());
        if (getConfigFor('BACKOFFICE_LITERATURE_FEATURE_FLAG')) {
          dispatch(fetchLiteratureDashboardInfo());
        }
        dispatch(backofficeLoginSuccess());
      }
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      notifyLoginError(error?.detail);
      dispatch(backofficeLoginError({ error }));
      dispatch(push(BACKOFFICE_LOGIN));
    }
  };
}
