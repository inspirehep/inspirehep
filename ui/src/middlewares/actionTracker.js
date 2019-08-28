import { Set } from 'immutable';

import { USER_LOGIN_SUCCESS } from '../actions/actionTypes';
import { setUserCategoryFromRoles } from '../tracker';

export default ({ getState }) => {
  return next => action => {
    const result = next(action);

    // track only necessary redux actions below:

    if (action.type === USER_LOGIN_SUCCESS) {
      const state = getState();
      const userRoles = Set(state.user.getIn(['data', 'roles']));
      setUserCategoryFromRoles(userRoles);
    }
    return result;
  };
};
