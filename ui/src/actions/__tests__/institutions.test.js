import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  INSTITUTION_REQUEST,
  INSTITUTION_SUCCESS,
  INSTITUTION_ERROR,
} from '../actionTypes';
import fetchInstitution from '../institutions';

const mockHttp = new MockAdapter(http.httpClient);

describe('institutions - async action creators', () => {
  describe('fetch institution', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates INSTITUTION_SUCCESS', async () => {
      mockHttp.onGet('/institutions/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: INSTITUTION_REQUEST, payload: { recordId: 123 } },
        { type: INSTITUTION_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchInstitution(123));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates INSTITUTION_ERROR', async () => {
      mockHttp.onGet('/institutions/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: INSTITUTION_REQUEST, payload: { recordId: 123 } },
        {
          type: INSTITUTION_ERROR,
          payload: {
            error: { message: 'Error', status: 500 },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchInstitution(123));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
