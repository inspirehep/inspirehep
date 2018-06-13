import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import { getStore } from '../../fixtures/store';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
} from '../actionTypes';
import { userLogin, userLogout } from '../user';
import loginInNewTab from '../../user/loginInNewTab';

jest.mock('../../user/loginInNewTab');

const mockHttp = new MockAdapter(axios);

describe('user - async action creator', () => {
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
    mockHttp.onGet('/logout').replyOnce(200);

    const expectedActions = [{ type: USER_LOGOUT_SUCCESS }];

    const store = getStore();
    await store.dispatch(userLogout());
    expect(store.getActions()).toEqual(expectedActions);

    mockHttp.reset();
    done();
  });
});
