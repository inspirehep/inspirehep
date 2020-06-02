import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  SEMINAR_REQUEST,
  SEMINAR_SUCCESS,
  SEMINAR_ERROR,
} from '../actionTypes';
import fetchSeminar from '../seminars';

const mockHttp = new MockAdapter(http.httpClient);

describe('seminars - async action creators', () => {
  describe('fetch seminar', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates SEMINAR_SUCCESS', async done => {
      mockHttp.onGet('/seminars/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: SEMINAR_REQUEST, payload: { recordId: 123 } },
        { type: SEMINAR_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchSeminar(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates SEMINAR_ERROR', async done => {
      mockHttp.onGet('/seminars/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: SEMINAR_REQUEST, payload: { recordId: 123 } },
        {
          type: SEMINAR_ERROR,
          payload: {
            error: { message: 'Error', status: 500 },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchSeminar(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
