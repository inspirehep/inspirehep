import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import fetch from '../exceptions';

const mockHttp = new MockAdapter(http);

const initState = fromJS({
  loading: false,
  data: [],
  error: {},
});

describe('exceptions dashboard - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('successful - creates EXCEPTIONS_SUCCESS', async done => {
    mockHttp.onGet('/migrator/errors').replyOnce(200, {});

    const expectedActions = [
      { type: types.EXCEPTIONS_REQUEST },
      { type: types.EXCEPTIONS_SUCCESS, payload: {} },
    ];

    const store = getStoreWithState(initState);
    await store.dispatch(fetch());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('unsuccessful - creates EXCEPTIONS_ERROR', async done => {
    mockHttp.onGet('/migrator/errors').replyOnce(500, {});

    const expectedActions = [
      { type: types.EXCEPTIONS_REQUEST },
      { type: types.EXCEPTIONS_ERROR, payload: undefined },
    ];

    const store = getStoreWithState(initState);
    await store.dispatch(fetch());
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
