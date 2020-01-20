import { fromJS } from 'immutable';

import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SIGN_UP_REQUEST,
  USER_SIGN_UP_SUCCESS,
  USER_SIGN_UP_ERROR,
  USER_SET_PREFERRED_CITE_FORMAT,
} from '../actions/actionTypes';
import { CITE_FORMAT_VALUES } from '../literature/constants';

export const initialState = fromJS({
  loggedIn: false,
  isSigningUp: false,
  signUpError: null,
  preferredCiteFormat: CITE_FORMAT_VALUES[0],
  data: {
    roles: [],
  },
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGN_UP_REQUEST:
      return state
        .set('isSigningUp', true)
        .set('signUpError', initialState.get('signUpError'));
    case USER_SIGN_UP_ERROR:
      return state
        .set('signUpError', fromJS(action.payload.data))
        .set('isSigningUp', initialState.get('isSigningUp'));
    case USER_LOGIN_ERROR:
    case USER_LOGOUT_SUCCESS:
      return state
        .set('loggedIn', false)
        .set('data', initialState.get('data'))
        .set('isSigningUp', initialState.get('isSigningUp'));
    case USER_LOGIN_SUCCESS:
    case USER_SIGN_UP_SUCCESS:
      return state
        .set('loggedIn', true)
        .set('signUpError', initialState.get('signUpError'))
        .set('isSigningUp', initialState.get('isSigningUp'))
        .set('data', fromJS(action.payload.data));
    case USER_SET_PREFERRED_CITE_FORMAT:
      return state.set('preferredCiteFormat', action.payload.format);
    default:
      return state;
  }
};

export default userReducer;
