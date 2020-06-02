import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import fetch from '../inspect';

const mockHttp = new MockAdapter(http.httpClient);

describe('inspect dashboard - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('successful - creates INSPECT_SUCCESS', async done => {
    mockHttp.onGet('/workflows/inspect_merge/123').replyOnce(200, {});

    const expectedActions = [
      { type: types.INSPECT_REQUEST, payload: { id: 123 } },
      { type: types.INSPECT_SUCCESS, payload: {} },
    ];

    const store = getStore();
    await store.dispatch(fetch(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('unsuccessful - creates INSPECT_ERROR', async done => {
    mockHttp.onGet('/workflows/inspect_merge/123').replyOnce(404, {});

    const expectedActions = [
      { type: types.INSPECT_REQUEST, payload: { id: 123 } },
      {
        type: types.INSPECT_ERROR,
        payload: {
          error: { status: 404 },
        },
        meta: { redirectableError: true },
      },
    ];

    const store = getStore();
    await store.dispatch(fetch(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
