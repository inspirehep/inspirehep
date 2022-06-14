import { push, goBack } from 'connected-react-router';
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

export function userLoginSuccess(user: $TSFixMe) {
  return {
    type: USER_LOGIN_SUCCESS,
    payload: user,
  };
}

export function userSignUpSuccess(user: $TSFixMe) {
  return {
    type: USER_SIGN_UP_SUCCESS,
    payload: user,
  };
}

function userLoginError(error: $TSFixMe) {
  return {
    type: USER_LOGIN_ERROR,
    payload: error,
  };
}

function userSignUpError(error: $TSFixMe) {
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

function userSignUpRequest() {
  return {
    type: USER_SIGN_UP_REQUEST,
  };
}

export function userSignUp(userEmail: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    dispatch(userSignUpRequest());
    try {
      const response = await http.post('/accounts/signup', userEmail);
      dispatch(userSignUpSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(userSignUpError(errorPayload));
    }
  };
}

export function fetchLoggedInUser() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
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

export function userLocalLogin(credentials: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    try {
      const response = await http.post('/accounts/login', credentials);
      dispatch(userLoginSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(userLoginError(errorPayload));
    }
  };
}

export function userLogout() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
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

export function userInactive() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
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

export function setPreference(name: $TSFixMe, value: $TSFixMe) {
  return {
    type: USER_SET_PREFERENCE,
    payload: { name, value },
  };
}

function updatingOrcidPushSetting(value: $TSFixMe) {
  return {
    type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
    payload: { value },
  };
}

function updateOrcidPushSettingSuccess(value: $TSFixMe) {
  return {
    type: USER_SET_ORCID_PUSH_SETTING_SUCCESS,
    payload: { value },
  };
}

function updateOrcidPushSettingError(errorPayload: $TSFixMe) {
  return {
    type: USER_SET_ORCID_PUSH_SETTING_ERROR,
    payload: errorPayload,
  };
}

export function updateOrcidPushSetting(value: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    dispatch(updatingOrcidPushSetting(value));
    try {
      await http.put('/accounts/settings/orcid-push', { value });
      dispatch(updateOrcidPushSettingSuccess(value));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(updateOrcidPushSettingError(errorPayload));
    }
  };
}
