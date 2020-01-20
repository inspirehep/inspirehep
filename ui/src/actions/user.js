import { push, goBack } from 'connected-react-router';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SET_PREFERRED_CITE_FORMAT,
  LOGGED_IN_USER_REQUEST,
} from './actionTypes';
import loginInNewTab from '../user/loginInNewTab';
import logout from '../user/logout';
import { HOME } from '../common/routes';

export function userLoginSuccess(user) {
  return {
    type: USER_LOGIN_SUCCESS,
    payload: user,
  };
}

function userLoginError(error) {
  return {
    type: USER_LOGIN_ERROR,
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

export function userLogin() {
  return async dispatch => {
    try {
      const user = await loginInNewTab();
      dispatch(userLoginSuccess(user));
    } catch (error) {
      dispatch(userLoginError(error));
    }
  };
}

export function fetchLoggedInUser() {
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

export function userLocalLogin(credentials) {
  return async (dispatch, getState, http) => {
    try {
      const response = await http.post('/login', credentials);
      dispatch(userLoginSuccess(response.data));
    } catch (error) {
      dispatch(userLoginError(error));
    }
  };
}

export function userLogout() {
  return async dispatch => {
    try {
      await logout();
      dispatch(userLogoutSuccess());

      // Hack to reload current page for logged out user
      dispatch(push(HOME));
      dispatch(goBack());
    } catch (error) {
      // TODO: dispatch logout error?
    }
  };
}

export function setPreferredCiteFormat(format) {
  return {
    type: USER_SET_PREFERRED_CITE_FORMAT,
    payload: { format },
  };
}
