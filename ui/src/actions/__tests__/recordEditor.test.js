import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
} from '../actionTypes';
import { fetchAuthor } from '../recordEditor';

const mockHttp = new MockAdapter(http.httpClient);

describe('recordEditor - async action creators', () => {
  describe('fetchAuthor', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates EDITOR_AUTHOR_SUCCESS', async () => {
      const responseData = { metadata: { control_number: 123 } };
      mockHttp.onGet('/editor/authors/123').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_AUTHOR_REQUEST },
        { type: EDITOR_AUTHOR_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_AUTHOR_ERROR', async () => {
      mockHttp
        .onGet('/editor/authors/123')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_AUTHOR_REQUEST },
        {
          type: EDITOR_AUTHOR_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
