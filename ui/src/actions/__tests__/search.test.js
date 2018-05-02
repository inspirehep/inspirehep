import { CALL_HISTORY_METHOD } from 'react-router-redux';
import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import search from '../search';

const mockHttp = new MockAdapter(http);
const stateWithScopeQuery = {
  search: fromJS({
    scope: {
      pathname: 'test',
      query: {
        size: 10,
      },
    },
  }),
};

const stateWithoutScopeQuery = {
  search: fromJS({
    scope: {
      pathname: 'test',
      query: {},
    },
  }),
};

describe('search - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('creates SEARCH_SUCCESS and pushes new history state when search is done', async (done) => {
    const testQueryUrl = 'test?size=10&q=test';
    mockHttp.onGet(testQueryUrl).replyOnce(200, {});

    const expectedActions = [
      { type: types.SEARCHING },
      { type: CALL_HISTORY_METHOD, payload: { args: [testQueryUrl], method: 'push' } },
      { type: types.SEARCH_SUCCESS, payload: {} },
    ];

    const store = getStoreWithState(stateWithScopeQuery);
    await store.dispatch(search({ q: 'test' }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates SEARCH_SUCCESS and pushes new history state when without search if scope query is present', async (done) => {
    const testQueryUrl = 'test?size=10';
    mockHttp.onGet(testQueryUrl).replyOnce(200, {});

    const expectedActions = [
      { type: types.SEARCHING },
      { type: CALL_HISTORY_METHOD, payload: { args: [testQueryUrl], method: 'push' } },
      { type: types.SEARCH_SUCCESS, payload: {} },
    ];

    const store = getStoreWithState(stateWithScopeQuery);
    await store.dispatch(search());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates SEARCH_SUCCESS but skips history state push if there is no query at all', async (done) => {
    const testQueryUrl = 'test?';
    mockHttp.onGet(testQueryUrl).replyOnce(200, {});

    const expectedActions = [
      { type: types.SEARCHING },
      { type: types.SEARCH_SUCCESS, payload: {} },
    ];

    const store = getStoreWithState(stateWithoutScopeQuery);
    await store.dispatch(search());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates SEARCH_ERROR when search fails', async (done) => {
    const testQueryUrl = 'test?size=10&q=test';
    mockHttp.onGet(testQueryUrl).networkError();

    const expectedActions = [
      { type: types.SEARCHING },
      { type: CALL_HISTORY_METHOD, payload: { args: [testQueryUrl], method: 'push' } },
      { type: types.SEARCH_ERROR, payload: undefined },
    ];

    const store = getStoreWithState(stateWithScopeQuery);
    await store.dispatch(search({ q: 'test' }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
