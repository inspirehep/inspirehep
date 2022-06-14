import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import {
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
  CONFERENCE_ERROR,
} from '../actionTypes';
import fetchConference from '../conferences';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('conferences - async action creators', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fetch conference', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      mockHttp.reset();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates CONFERENCE_SUCCESS', async (done: any) => {
      mockHttp.onGet('/conferences/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: CONFERENCE_REQUEST, payload: { recordId: 123 } },
        { type: CONFERENCE_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchConference(123));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates CONFERENCE_ERROR', async (done: any) => {
      mockHttp.onGet('/conferences/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: CONFERENCE_REQUEST, payload: { recordId: 123 } },
        {
          type: CONFERENCE_ERROR,
          payload: {
            error: { message: 'Error', status: 500 },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchConference(123));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
