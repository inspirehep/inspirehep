import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
} from './actionTypes';
import loginInNewTab from '../user/loginInNewTab';
import logout from '../user/logout';

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

export function userLocalLogin(credentials) {
  return async (dispatch, getState, http) => {
    try {
      const user = await http.post('/login', credentials);
      dispatch(userLoginSuccess(user));
    } catch (error) {
      dispatch(userLoginError(error));
    }
  };
}

function userLogutSuccess() {
  return {
    type: USER_LOGOUT_SUCCESS,
  };
}

export function userLogout() {
  return async dispatch => {
    try {
      await logout();
      dispatch(userLogutSuccess());
    } catch (error) {
      // TODO: dispatch logout error?
    }
  };
}
