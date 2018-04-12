import configureMockStore from 'redux-mock-store';
import { CALL_HISTORY_METHOD } from 'react-router-redux';
import MockAdapter from 'axios-mock-adapter';

import http from '../../common/http';
import { thunkMiddleware } from '../../store';
import * as types from '../actionTypes';
import search from '../search';

const mockHttp = new MockAdapter(http);
const mockStore = configureMockStore([thunkMiddleware]);

describe('search - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('creates SEARCH_SUCCESS and pushes new history state when search request is done', async (done) => {
    const testQueryUrl = '?q=test';
    mockHttp.onGet(testQueryUrl).replyOnce(200, {});

    const expectedActions = [
      { type: types.SEARCHING },
      { type: CALL_HISTORY_METHOD, payload: { args: [testQueryUrl], method: 'push' } },
      { type: types.SEARCH_SUCCESS, payload: {} },
    ];

    const store = mockStore();
    await store.dispatch(search('test'));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates SEARCH_ERROR when search request fails', async (done) => {
    const testQueryUrl = '?q=test';
    mockHttp.onGet(testQueryUrl).networkError();

    const expectedActions = [
      { type: types.SEARCHING },
      { type: types.SEARCH_ERROR, payload: undefined },
    ];

    const store = mockStore();
    await store.dispatch(search('test'));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
