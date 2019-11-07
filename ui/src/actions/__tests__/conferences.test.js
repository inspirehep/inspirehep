import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
  CONFERENCE_ERROR,
} from '../actionTypes';
import fetchConference from '../conferences';

const mockHttp = new MockAdapter(http);

describe('conferences - async action creators', () => {
  describe('fetch conference', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates CONFERENCE_SUCCESS', async done => {
      mockHttp.onGet('/conferences/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: CONFERENCE_REQUEST, payload: { recordId: 123 } },
        { type: CONFERENCE_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchConference(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates CONFERENCE_ERROR', async done => {
      mockHttp.onGet('/conferences/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: CONFERENCE_REQUEST, payload: { recordId: 123 } },
        {
          type: CONFERENCE_ERROR,
          payload: { message: 'Error', status: 500 },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchConference(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
