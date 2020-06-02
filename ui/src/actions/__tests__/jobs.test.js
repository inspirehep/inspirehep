import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import { JOB_REQUEST, JOB_SUCCESS, JOB_ERROR } from '../actionTypes';
import fetchJob from '../jobs';

const mockHttp = new MockAdapter(http.httpClient);

describe('jobs - async action creators', () => {
  describe('fetch job', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates JOB_SUCCESS', async done => {
      mockHttp.onGet('/jobs/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: JOB_REQUEST, payload: { recordId: 123 } },
        { type: JOB_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchJob(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates JOB_ERROR', async done => {
      mockHttp.onGet('/jobs/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: JOB_REQUEST, payload: { recordId: 123 } },
        {
          type: JOB_ERROR,
          payload: {
            error: { message: 'Error', status: 500 },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchJob(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
