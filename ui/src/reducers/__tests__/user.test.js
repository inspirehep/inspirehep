import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../user';
import {
  USER_LOGIN_ERROR,
  USER_LOGOUT_SUCCESS,
  USER_LOGIN_SUCCESS,
} from '../../actions/actionTypes';

describe('user reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('USER_LOGIN_SUCCESS', () => {
    const payload = {
      data: { username: 'dude', roles: ['dudelikeuser'] },
    };
    const state = reducer(Map(), { type: USER_LOGIN_SUCCESS, payload });
    const expected = fromJS({
      loggedIn: true,
      data: payload.data,
    });
    expect(state.sort()).toEqual(expected.sort());
  });

  it('USER_LOGIN_ERROR', () => {
    const state = reducer(Map(), { type: USER_LOGIN_ERROR });
    const expected = fromJS({
      loggedIn: false,
      data: initialState.get('data'),
    });
    expect(state).toEqual(expected);
  });

  it('USER_LOGOUT_SUCCESS', () => {
    const state = reducer(Map(), { type: USER_LOGOUT_SUCCESS });
    const expected = fromJS({
      loggedIn: false,
      data: initialState.get('data'),
    });
    expect(state).toEqual(expected);
  });
});
