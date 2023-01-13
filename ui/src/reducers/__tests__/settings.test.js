import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../settings';
import {
  SETTINGS_CHANGE_EMAIL_REQUEST,
  SETTINGS_CHANGE_EMAIL_ERROR,
  SETTINGS_CHANGE_EMAIL_SUCCESS,
} from '../../actions/actionTypes';

describe('settings reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('SETTINGS_CHANGE_EMAIL_REQUEST', () => {
    const state = reducer(Map(), { type: SETTINGS_CHANGE_EMAIL_REQUEST });
    const expected = fromJS({
      changeEmailRequest: true,
      changeEmailError: null,
    });
    expect(state.sort()).toEqual(expected.sort());
  });

  it('SETTINGS_CHANGE_EMAIL_SUCCESS', () => {
    const payload = {
      value: 'aa@ee.pl',
    };

    const state = reducer(Map(), {
      type: SETTINGS_CHANGE_EMAIL_SUCCESS,
      payload,
    });
    const expected = fromJS({
      data: {
        email: 'aa@ee.pl',
      },
      changeEmailError: null,
      changeEmailRequest: false,
    });
    expect(state.sort()).toEqual(expected.sort());
  });

  it('SETTINGS_CHANGE_EMAIL_ERROR', () => {
    const payload = {
      error: 'Error',
    };

    const state = reducer(Map(), {
      type: SETTINGS_CHANGE_EMAIL_ERROR,
      payload,
    });
    const expected = fromJS({
      changeEmailRequest: false,
      changeEmailError: 'Error',
    });
    expect(state).toEqual(expected);
  });
});
