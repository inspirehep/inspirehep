import { fromJS, Map } from 'immutable';

import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loggedIn: false,
  data: {},
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN_ERROR:
    case USER_LOGOUT_SUCCESS:
      return state.set('loggedIn', false).set('data', Map());
    case USER_LOGIN_SUCCESS:
      return state
        .set('loggedIn', true)
        .set('data', fromJS(action.payload.data));
    default:
      return state;
  }
};

export default userReducer;
