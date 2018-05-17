import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import fetch from '../literature';

const mockHttp = new MockAdapter(http);

const initState = fromJS({
  loading: false,
  data: {},
  error: {},
});

describe('literature - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('happy - creates LITERATURE_SUCCESS', async (done) => {
    mockHttp.onGet('/literature/123').replyOnce(200, {});

    const expectedActions = [
      { type: types.LITERATURE_REQUEST },
      { type: types.LITERATURE_SUCCESS, payload: {} },
    ];

    const store = getStoreWithState(initState);
    await store.dispatch(fetch(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('unhappy - creates LITERATURE_ERROR', async (done) => {
    mockHttp.onGet('/literature/123').replyOnce(500, {});

    const expectedActions = [
      { type: types.LITERATURE_REQUEST },
      { type: types.LITERATURE_ERROR, payload: undefined },
    ];

    const store = getStoreWithState(initState);
    await store.dispatch(fetch(123));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
