import { fromJS } from 'immutable';

import {
  USER_LOGIN_ERROR,
  USER_LOGOUT_SUCCESS,
  USER_LOGIN_SUCCESS,
} from '../../actions/actionTypes';
import middleware, {
  USER_STATE_ITEM_NAME,
  reHydrateRootStateWithUser,
} from '../persistUserState';

describe('persistUserState middleware', () => {
  it('persists user state to local storage when a user action is dispatched', () => {
    const userActionTypes = [
      USER_LOGIN_ERROR,
      USER_LOGOUT_SUCCESS,
      USER_LOGIN_SUCCESS,
    ];
    const userActions = userActionTypes.map(actionType => ({
      type: actionType,
    }));
    const getState = () => ({ user: fromJS({ foo: 'bar' }) });
    const next = jest.fn();
    const dispatch = middleware({ getState })(next);
    userActions.forEach(action => {
      dispatch(action);
      expect(next).toHaveBeenCalledWith(action);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        USER_STATE_ITEM_NAME,
        '{"foo":"bar"}'
      );
    });
    localStorage.setItem.mockClear();
  });

  it('does not persis user state to local storage when another kind of action is dispatched', () => {
    const getState = () => ({ user: fromJS({ foo: 'bar' }) });
    const next = jest.fn();
    const dispatch = middleware({ getState })(next);
    const action = { type: 'NOT_A_USER_ACTION' };
    dispatch(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});

describe('reHydrateRootStateWithUser', () => {
  it('returns root state with user from local storage', () => {
    localStorage.setItem(USER_STATE_ITEM_NAME, '{"foo":"bar"}');
    const userState = fromJS({ foo: 'bar' });
    const expected = { user: userState };
    const state = reHydrateRootStateWithUser();
    expect(state).toEqual(expected);
    localStorage.clear();
  });

  it('returns undefined if local storage does not have user state', () => {
    const state = reHydrateRootStateWithUser();
    expect(state).toEqual(undefined);
  });
});
