import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  EXPERIMENT_SUCCESS,
  EXPERIMENT_REQUEST,
  EXPERIMENT_ERROR,
} from '../actionTypes';
import fetchExperiment from '../experiments';

const mockHttp = new MockAdapter(http);

describe('experiments - async action creators', () => {
  describe('fetch experiment', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates EXPERIMENT_SUCCESS', async () => {
      mockHttp.onGet('/experiments/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: EXPERIMENT_REQUEST, payload: { recordId: 123 } },
        { type: EXPERIMENT_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchExperiment(123));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EXPERIMENT_ERROR', async () => {
      mockHttp.onGet('/experiments/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EXPERIMENT_REQUEST, payload: { recordId: 123 } },
        {
          type: EXPERIMENT_ERROR,
          payload: {
            error: { message: 'Error', status: 500 },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchExperiment(123));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
