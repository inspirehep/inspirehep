import { push, goBack } from 'connected-react-router';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SIGN_UP_REQUEST,
  USER_SIGN_UP_ERROR,
  USER_SIGN_UP_SUCCESS,
  USER_SET_PREFERRED_CITE_FORMAT,
  LOGGED_IN_USER_REQUEST,
} from './actionTypes';
import loginInNewTab from '../user/loginInNewTab';
import { HOME, USER_SIGNUP } from '../common/routes';

export function userLoginSuccess(user) {
  return {
    type: USER_LOGIN_SUCCESS,
    payload: user,
  };
}

export function userSignUpSuccess(user) {
  return {
    type: USER_SIGN_UP_SUCCESS,
    payload: user,
  };
}

function userLoginError(error) {
  return {
    type: USER_LOGIN_ERROR,
    payload: error,
  };
}

function userSignUpError(error) {
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

export function userSignUp(userEmail) {
  return async (dispatch, getState, http) => {
    dispatch(userSignUpRequest());
    try {
      const response = await http.post('/accounts/signup', userEmail);
      dispatch(userSignUpSuccess(response.data));
    } catch (error) {
      dispatch(userSignUpError(error.response));
    }
  };
}

export function userLogin() {
  return async dispatch => {
    try {
      const user = await loginInNewTab();
      if (user.user_needs_sign_up) {
        dispatch(push(USER_SIGNUP));
      } else {
        dispatch(userLoginSuccess(user));
      }
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
      const response = await http.post('/accounts/login', credentials);
      dispatch(userLoginSuccess(response.data));
    } catch (error) {
      dispatch(userLoginError(error));
    }
  };
}

export function userLogout() {
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

export function setPreferredCiteFormat(format) {
  return {
    type: USER_SET_PREFERRED_CITE_FORMAT,
    payload: { format },
  };
}
