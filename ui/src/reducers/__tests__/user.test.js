import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../user';
import {
  USER_LOGIN_ERROR,
  USER_LOGOUT_SUCCESS,
  USER_LOGIN_SUCCESS,
  USER_SIGN_UP_SUCCESS,
  USER_SIGN_UP_ERROR,
  USER_SET_PREFERRED_CITE_FORMAT,
  USER_SET_ORCID_PUSH_SETTING_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_ERROR,
  USER_SET_ORCID_PUSH_SETTING_SUCCESS,
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
      signUpError: null,
      isSigningUp: false,
      loggedIn: true,
      data: payload.data,
    });
    expect(state.sort()).toEqual(expected.sort());
  });

  it('USER_SIGN_UP_SUCCESS', () => {
    const payload = {
      data: { username: 'dude', roles: ['dudelikeuser'] },
    };
    const state = reducer(Map(), { type: USER_SIGN_UP_SUCCESS, payload });
    const expected = fromJS({
      signUpError: null,
      isSigningUp: false,
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
      isSigningUp: false,
    });
    expect(state).toEqual(expected);
  });

  it('USER_SIGN_UP_ERROR', () => {
    const payload = {
      error: { message: 'Error here' },
    };
    const state = reducer(Map(), {
      type: USER_SIGN_UP_ERROR,
      payload,
    });

    const expected = fromJS({
      signUpError: {
        message: 'Error here',
      },
      isSigningUp: false,
    });
    expect(state).toEqual(expected);
  });

  it('USER_LOGOUT_SUCCESS', () => {
    const state = reducer(Map(), { type: USER_LOGOUT_SUCCESS });
    const expected = fromJS({
      loggedIn: false,
      data: initialState.get('data'),
      isSigningUp: false,
    });
    expect(state).toEqual(expected);
  });

  it('USER_SET_PREFERRED_CITE_FORMAT', () => {
    const format = 'vnd+inspire.latex.eu+x-latex';
    const state = reducer(Map(), {
      type: USER_SET_PREFERRED_CITE_FORMAT,
      payload: { format },
    });
    const expected = fromJS({
      preferredCiteFormat: format,
    });
    expect(state).toEqual(expected);
  });

  it('USER_SET_ORCID_PUSH_SETTING_REQUEST', () => {
    const state = reducer(Map(), {
      type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
      payload: { value: true },
    });
    const expected = fromJS({
      isUpdatingOrcidPushSetting: true,
      updateOrcidPushSettingError: initialState.get(
        'updateOrcidPushSettingError'
      ),
    });
    expect(state).toEqual(expected);
  });

  it('USER_SET_ORCID_PUSH_SETTING_ERROR', () => {
    const state = reducer(Map(), {
      type: USER_SET_ORCID_PUSH_SETTING_ERROR,
      payload: { error: { message: 'Error' } },
    });
    const expected = fromJS({
      isUpdatingOrcidPushSetting: false,
      updateOrcidPushSettingError: { message: 'Error' },
    });
    expect(state).toEqual(expected);
  });

  it('USER_SET_ORCID_PUSH_SETTING_SUCCESS', () => {
    const settingValue = true;
    const state = reducer(Map(), {
      type: USER_SET_ORCID_PUSH_SETTING_SUCCESS,
      payload: { value: settingValue },
    });
    const expected = fromJS({
      isUpdatingOrcidPushSetting: false,
      data: {
        allow_orcid_push: settingValue,
      },
      updateOrcidPushSettingError: initialState.get(
        'updateOrcidPushSettingError'
      ),
    });
    expect(state).toEqual(expected);
  });

  it('USER_SET_ORCID_PUSH_SETTING_REQUEST', () => {
    const state = reducer(Map(), { type: USER_SET_ORCID_PUSH_SETTING_REQUEST });
    const expected = fromJS({
      isUpdatingOrcidPushSetting: true,
      updateOrcidPushSettingError: initialState.get(
        'updateOrcidPushSettingError'
      ),
    });
    expect(state).toEqual(expected);
  });
});
