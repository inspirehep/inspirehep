import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import {
  SETTINGS_CHANGE_EMAIL_ERROR,
  SETTINGS_CHANGE_EMAIL_SUCCESS,
  SETTINGS_CHANGE_EMAIL_REQUEST,
} from '../actionTypes';
import { changeEmailAddress } from '../settings';
import http from '../../common/http.ts';

const mockHttp = new MockAdapter(http.httpClient);

describe('settings - async action creator', () => {
  it('successful email change creates SETTINGS_CHANGE_EMAIL_SUCCESS', async () => {
    const email = 'test@testemail.thing';
    mockHttp
      .onPost('/accounts/settings/update-email')
      .replyOnce(200, { message: 'Success' });

    const expectedActions = [
      { type: SETTINGS_CHANGE_EMAIL_REQUEST },
      { type: SETTINGS_CHANGE_EMAIL_SUCCESS, payload: { message: 'Success' } },
    ];

    const store = getStore();
    await store.dispatch(changeEmailAddress(email));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('unsuccessful email change creates SETTINGS_CHANGE_EMAIL_ERROR', async () => {
    mockHttp
      .onPost('/accounts/settings/update-email')
      .replyOnce(500, { message: 'Error' });

    const expectedActions = [
      { type: SETTINGS_CHANGE_EMAIL_REQUEST },
      {
        type: SETTINGS_CHANGE_EMAIL_ERROR,
        payload: {
          error: { message: 'Error', status: 500 },
        },
      },
    ];

    const store = getStore();
    await store.dispatch(changeEmailAddress(''));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
