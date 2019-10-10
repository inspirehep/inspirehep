import { fromJS } from 'immutable';

import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SET_PREFERRED_CITE_FORMAT,
} from '../actions/actionTypes';
import { CITE_FORMAT_VALUES } from '../literature/constants';

export const initialState = fromJS({
  loggedIn: false,
  preferredCiteFormat: CITE_FORMAT_VALUES[0],
  data: {
    roles: [],
  },
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN_ERROR:
    case USER_LOGOUT_SUCCESS:
      return state.set('loggedIn', false).set('data', initialState.get('data'));
    case USER_LOGIN_SUCCESS:
      return state
        .set('loggedIn', true)
        .set('data', fromJS(action.payload.data));
    case USER_SET_PREFERRED_CITE_FORMAT:
      return state.set('preferredCiteFormat', action.payload.format);
    default:
      return state;
  }
};

export default userReducer;
