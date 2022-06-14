import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import {
  SEMINAR_REQUEST,
  SEMINAR_SUCCESS,
  SEMINAR_ERROR,
} from '../actionTypes';
import fetchSeminar from '../seminars';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('seminars - async action creators', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fetch seminar', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      mockHttp.reset();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates SEMINAR_SUCCESS', async (done: any) => {
      mockHttp.onGet('/seminars/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: SEMINAR_REQUEST, payload: { recordId: 123 } },
        { type: SEMINAR_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchSeminar(123));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates SEMINAR_ERROR', async (done: any) => {
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
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
