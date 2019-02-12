import { fromJS } from 'immutable';

import {
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_LOGIN_ERROR,
} from '../actions/actionTypes';

export const USER_STATE_ITEM_NAME = 'state.user';
const USER_ACTION_TYPES = [
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_LOGIN_ERROR,
];

export function reHydrateRootStateWithUser() {
  const rawUserState = localStorage.getItem(USER_STATE_ITEM_NAME);
  if (rawUserState !== null) {
    const user = fromJS(JSON.parse(rawUserState));
    return { user };
  }
  return undefined;
}

export default function({ getState }) {
  return next => action => {
    const result = next(action);
    const isUserAction = USER_ACTION_TYPES.includes(action.type);
    if (isUserAction) {
      localStorage.setItem(
        USER_STATE_ITEM_NAME,
        JSON.stringify(getState().user)
      );
    }
    return result;
  };
}
