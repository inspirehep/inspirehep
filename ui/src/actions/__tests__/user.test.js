import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { push, goBack } from 'connected-react-router';

import { getStore } from '../../fixtures/store';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  LOGGED_IN_USER_REQUEST,
} from '../actionTypes';
import { userLogin, userLogout, fetchLoggedInUser } from '../user';
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
    // mock axios directly since it's using axios instead of http client wrapper
    const mockAxios = new MockAdapter(axios);

    mockAxios.onGet('/logout').replyOnce(200);

    const expectedActions = [
      { type: USER_LOGOUT_SUCCESS },
      push(HOME),
      goBack(),
    ];

    const store = getStore();
    await store.dispatch(userLogout());
    expect(store.getActions()).toEqual(expectedActions);

    // needs to restore in order not to mess with other tests cases which uses `http` client mock
    mockAxios.restore();
    done();
  });
});
