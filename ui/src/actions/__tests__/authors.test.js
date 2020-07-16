import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
} from '../actionTypes';
import fetchAuthor, {
  setPulicationSelection,
  clearPulicationSelection,
} from '../authors';

const mockHttp = new MockAdapter(http.httpClient);

describe('AUTHOR - async action creators', () => {
  describe('fetch author', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates AUTHOR_SUCCESS', async done => {
      mockHttp.onGet('/authors/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        { type: AUTHOR_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates AUTHOR_ERROR', async done => {
      mockHttp.onGet('/authors/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        {
          type: AUTHOR_ERROR,
          payload: {
            error: {
              message: 'Error',
              status: 500,
            },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('select publication', () => {
    it('setPulicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_SET,
          payload: { publicationIds: [1, 2], selected: true },
        },
      ];

      const store = getStore();
      store.dispatch(setPulicationSelection([1, 2], true));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('clearPulicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearPulicationSelection());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
