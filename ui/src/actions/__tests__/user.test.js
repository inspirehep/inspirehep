import MockAdapter from 'axios-mock-adapter';
import { push, goBack } from 'connected-react-router';

import { getStore } from '../../fixtures/store';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  LOGGED_IN_USER_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_SUCCESS,
  USER_SET_ORCID_PUSH_SETTING_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_ERROR,
} from '../actionTypes';
import {
  userLogin,
  userLogout,
  fetchLoggedInUser,
  updateOrcidPushSetting,
} from '../user';
import loginInNewTab from '../../user/loginInNewTab';
import http from '../../common/http';
import { HOME } from '../../common/routes';

jest.mock('../../user/loginInNewTab');

const mockHttp = new MockAdapter(http);

describe('user - async action creator', () => {
  it('successful logged in user fetch creates USER_LOGIN_SUCCESS', async () => {
    const user = { data: { email: 'test@testemail.thing' } };
    mockHttp.onGet('/accounts/me').replyOnce(200, user);

    const expectedActions = [
      { type: LOGGED_IN_USER_REQUEST },
      { type: USER_LOGIN_SUCCESS, payload: user },
    ];

    const store = getStore();
    await store.dispatch(fetchLoggedInUser());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('unsuccessful logged in user fetch creates USER_LOGOUT_SUCCESS', async () => {
    mockHttp.onGet('/acconts/me').replyOnce(401);

    const expectedActions = [
      { type: LOGGED_IN_USER_REQUEST },
      { type: USER_LOGOUT_SUCCESS },
    ];

    const store = getStore();
    await store.dispatch(fetchLoggedInUser());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('successful login creates USER_LOGIN_SUCCESS', async done => {
    const user = { data: { username: 'test' } };
    loginInNewTab.mockReturnValueOnce(Promise.resolve(user));

    const expectedActions = [{ type: USER_LOGIN_SUCCESS, payload: user }];

    const store = getStore();
    await store.dispatch(userLogin());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('unsuccessful login creates USER_LOGIN_ERROR', async done => {
    const error = new Error('Test');
    loginInNewTab.mockReturnValueOnce(Promise.reject(error));

    const expectedActions = [{ type: USER_LOGIN_ERROR, payload: error }];

    const store = getStore();
    await store.dispatch(userLogin());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('successful logout creates USER_LOGOUT_SUCCESS', async done => {
    mockHttp.onGet('/accounts/logout').replyOnce(200);

    const expectedActions = [
      { type: USER_LOGOUT_SUCCESS },
      push(HOME),
      goBack(),
    ];

    const store = getStore();
    await store.dispatch(userLogout());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('successful update orcid push settings creates USER_SET_ORCID_PUSH_SETTING_SUCCESS', async () => {
    mockHttp.onPut('/accounts/settings/orcid-push').replyOnce(200);

    const orcidPushValue = true;
    const expectedActions = [
      {
        type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
        payload: { value: orcidPushValue },
      },
      {
        type: USER_SET_ORCID_PUSH_SETTING_SUCCESS,
        payload: { value: orcidPushValue },
      },
    ];

    const store = getStore();
    await store.dispatch(updateOrcidPushSetting(orcidPushValue));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('unsuccessful update orcid push settings creates USER_SET_ORCID_PUSH_SETTING_ERROR', async () => {
    mockHttp
      .onPut('/accounts/settings/orcid-push')
      .replyOnce(500, { message: 'Error' });
    const orcidPushValue = false;
    const expectedActions = [
      {
        type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
        payload: { value: orcidPushValue },
      },
      {
        type: USER_SET_ORCID_PUSH_SETTING_ERROR,
        payload: { error: { message: 'Error', status: 500 } },
      },
    ];

    const store = getStore();
    await store.dispatch(updateOrcidPushSetting(orcidPushValue));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
