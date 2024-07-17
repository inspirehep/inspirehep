/* eslint-disable no-underscore-dangle */
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
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
} from './actionTypes';
import {
  BACKOFFICE_API,
  BACKOFFICE_LOGIN,
  BACKOFFICE_SEARCH_API,
  HOLDINGPEN_NEW,
  HOLDINGPEN_LOGIN_NEW,
} from '../common/routes';
import { Credentials } from '../types';
import storage from '../common/storage';
import { notifyLoginError } from '../holdingpen-new/notifications';
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

function updateQuery(data: any) {
  return {
    type: HOLDINGPEN_SEARCH_QUERY_UPDATE,
    payload: data,
  };
}

export function holdingpenLogin(
  credentials: Credentials
): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
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

export function fetchSearchResults(query: {
  page: number;
  size: number;
}): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(searching());

    const resolveQuery = `${BACKOFFICE_SEARCH_API}?page=${query.page}&size=${query.size}`;

    try {
      const response = await httpClient.get(`${resolveQuery}`);
      dispatch(searchSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(searchError(error));
    }
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

export function searchQueryUpdate(query: {
  page: number;
  size: number;
}): (dispatch: ActionCreator<Action>) => Promise<void> {
  return async (dispatch) => {
    dispatch(updateQuery(query));
  };
}
