import { push, goBack } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';

import { HttpClientWrapper } from '../common/http';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SIGN_UP_REQUEST,
  USER_SIGN_UP_ERROR,
  USER_SIGN_UP_SUCCESS,
  LOGGED_IN_USER_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_SUCCESS,
  USER_SET_ORCID_PUSH_SETTING_ERROR,
  USER_SET_PREFERENCE,
} from './actionTypes';
import { HOME } from '../common/routes';
import { httpErrorToActionPayload } from '../common/utils';
import notifySessionExpired from '../user/sessionExpireNotification';
import { Credentials, User } from '../types';

export function userLoginSuccess(user: User) {
  return {
    type: USER_LOGIN_SUCCESS,
    payload: user,
  };
}

export function userSignUpSuccess(user: User) {
  return {
    type: USER_SIGN_UP_SUCCESS,
    payload: user,
  };
}

function userLoginError(error: { error: Error }) {
  return {
    type: USER_LOGIN_ERROR,
    payload: error,
  };
}

function userSignUpError(error: { error: Error }) {
  return {
    type: USER_SIGN_UP_ERROR,
    payload: error,
  };
}

function userLogoutSuccess() {
  return {
    type: USER_LOGOUT_SUCCESS,
  };
}

function fetchingLoggedInUser() {
  return {
    type: LOGGED_IN_USER_REQUEST,
  };
}

export function userSignUpRequest() {
  return {
    type: USER_SIGN_UP_REQUEST,
  };
}

export function userSignUp(
  userEmail: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(userSignUpRequest());
    try {
      const response = await http.post('/accounts/signup', userEmail);
      dispatch(userSignUpSuccess(response.data));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(userSignUpError({ error }));
    }
  };
}

export function fetchLoggedInUser(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingLoggedInUser());
    try {
      const response = await http.get('/accounts/me');
      dispatch(userLoginSuccess(response.data));
    } catch (error) {
      // TODO: differentiate between 401 and other errors
      dispatch(userLogoutSuccess());
    }
  };
}

export function userLocalLogin(
  credentials: Credentials
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      const response = await http.post('/accounts/login', credentials);
      dispatch(userLoginSuccess(response.data));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(userLoginError({ error }));
    }
  };
}

export function userLogout(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      await http.get('/accounts/logout');
      dispatch(userLogoutSuccess());

      // Hack to reload current page for logged out user
      dispatch(push(HOME));
      dispatch(goBack());
    } catch (error) {
      // TODO: dispatch logout error?
    }
  };
}

export function userInactive(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    if (getState().user.get('loggedIn')) {
      try {
        await http.get('/accounts/me');
      } catch (error) {
        notifySessionExpired();
        dispatch(userLogoutSuccess());
      }
    }
  };
}

export function setPreference(name: string, value: string) {
  return {
    type: USER_SET_PREFERENCE,
    payload: { name, value },
  };
}

function updatingOrcidPushSetting(value: boolean) {
  return {
    type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
    payload: { value },
  };
}

function updateOrcidPushSettingSuccess(value: boolean) {
  return {
    type: USER_SET_ORCID_PUSH_SETTING_SUCCESS,
    payload: { value },
  };
}

function updateOrcidPushSettingError(error: { error: Error }) {
  return {
    type: USER_SET_ORCID_PUSH_SETTING_ERROR,
    payload: error,
  };
}

export function updateOrcidPushSetting(
  value: boolean
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(updatingOrcidPushSetting(value));
    try {
      await http.put('/accounts/settings/orcid-push', { value });
      dispatch(updateOrcidPushSettingSuccess(value));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(updateOrcidPushSettingError({ error }));
    }
  };
}
