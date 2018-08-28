import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import fetch from '../citations';

const mockHttp = new MockAdapter(http);

describe('citations - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('creates CITATIONS_SUCCESS if succesful', async done => {
    mockHttp
      .onGet('/literature/123/citations?page=1&size=10')
      .replyOnce(200, { foo: 'bar' });

    const expectedActions = [
      { type: types.CITATIONS_REQUEST },
      { type: types.CITATIONS_SUCCESS, payload: { foo: 'bar' } },
    ];

    const store = getStore();
    await store.dispatch(fetch('literature', 123, { page: 1, pageSize: 10 }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates CITATIONS_ERROR if unsuccesful', async done => {
    mockHttp
      .onGet('/authors/123/citations?page=2&size=10')
      .replyOnce(500, { message: 'error' });

    const expectedActions = [
      { type: types.CITATIONS_REQUEST },
      { type: types.CITATIONS_ERROR, payload: { message: 'error' } },
    ];

    const store = getStore();
    await store.dispatch(fetch('authors', 123, { page: 2, pageSize: 10 }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
