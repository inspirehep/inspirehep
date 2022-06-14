import { Map, fromJS } from 'immutable';

import reducer, {
  initialState,
  CITATION_SUMMARY_ENABLING_PREFERENCE,
} from '../user';
import {
  USER_LOGIN_ERROR,
  USER_LOGOUT_SUCCESS,
  USER_LOGIN_SUCCESS,
  USER_SIGN_UP_SUCCESS,
  USER_SIGN_UP_ERROR,
  USER_SET_ORCID_PUSH_SETTING_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_ERROR,
  USER_SET_ORCID_PUSH_SETTING_SUCCESS,
  USER_SET_PREFERENCE,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('user reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.sort()).toEqual(expected.sort());
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.sort()).toEqual(expected.sort());
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('USER_LOGIN_ERROR', () => {
    const state = reducer(Map(), { type: USER_LOGIN_ERROR });
    const expected = fromJS({
      loggedIn: false,
      data: initialState.get('data'),
      isSigningUp: false,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('USER_LOGOUT_SUCCESS', () => {
    const state = reducer(Map(), { type: USER_LOGOUT_SUCCESS });
    const expected = fromJS({
      loggedIn: false,
      data: initialState.get('data'),
      isSigningUp: false,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('USER_SET_ORCID_PUSH_SETTING_ERROR', () => {
    const state = reducer(Map(), {
      type: USER_SET_ORCID_PUSH_SETTING_ERROR,
      payload: { error: { message: 'Error' } },
    });
    const expected = fromJS({
      isUpdatingOrcidPushSetting: false,
      updateOrcidPushSettingError: { message: 'Error' },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('USER_SET_ORCID_PUSH_SETTING_REQUEST', () => {
    const state = reducer(Map(), { type: USER_SET_ORCID_PUSH_SETTING_REQUEST });
    const expected = fromJS({
      isUpdatingOrcidPushSetting: true,
      updateOrcidPushSettingError: initialState.get(
        'updateOrcidPushSettingError'
      ),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('USER_SET_PREFERENCE', () => {
    const state = reducer(Map(), {
      type: USER_SET_PREFERENCE,
      payload: { name: CITATION_SUMMARY_ENABLING_PREFERENCE, value: true },
    });
    const expected = fromJS({
      preferences: {
        [CITATION_SUMMARY_ENABLING_PREFERENCE]: true,
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });
});
