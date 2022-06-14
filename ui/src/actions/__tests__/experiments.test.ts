import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import {
  EXPERIMENT_SUCCESS,
  EXPERIMENT_REQUEST,
  EXPERIMENT_ERROR,
} from '../actionTypes';
import fetchExperiment from '../experiments';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('experiments - async action creators', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fetch experiment', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      mockHttp.reset();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates EXPERIMENT_SUCCESS', async () => {
      mockHttp.onGet('/experiments/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: EXPERIMENT_REQUEST, payload: { recordId: 123 } },
        { type: EXPERIMENT_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchExperiment(123));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
