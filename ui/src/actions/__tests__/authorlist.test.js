import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  AUTHORLIST_REQUEST,
  AUTHORLIST_SUCCESS,
  AUTHORLIST_ERROR,
} from '../actionTypes';
import { submitAuthorlist } from '../authorlist';

const mockHttp = new MockAdapter(http.httpClient);

describe('authorlist - async action creators', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('creates AUTHORLIST_SUCCESS if successful', async () => {
    mockHttp
      .onPost('editor/authorlist/text', { text: 'authorlist' })
      .replyOnce(200, { foo: 'bar' });

    const expectedActions = [
      { type: AUTHORLIST_REQUEST },
      {
        type: AUTHORLIST_SUCCESS,
        payload: { foo: 'bar' },
      },
    ];

    const store = getStore();
    await store.dispatch(submitAuthorlist('authorlist'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('creates AUTHORLIST_ERROR if not successful', async () => {
    mockHttp
      .onPost('editor/authorlist/text')
      .replyOnce(400, { message: 'Error' });

    const expectedActions = [
      { type: AUTHORLIST_REQUEST },
      {
        type: AUTHORLIST_ERROR,
        payload: {
          error: { message: 'Error', status: 400 },
        },
      },
    ];

    const store = getStore();
    await store.dispatch(submitAuthorlist('authorlist'));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
