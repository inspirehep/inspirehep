import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import * as types from '../actionTypes';
import fetch from '../exceptions';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('exceptions dashboard - async action creator', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    mockHttp.reset();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('successful - creates EXCEPTIONS_SUCCESS', async (done: any) => {
    mockHttp.onGet('/migrator/errors').replyOnce(200, {});

    const expectedActions = [
      { type: types.EXCEPTIONS_REQUEST },
      { type: types.EXCEPTIONS_SUCCESS, payload: {} },
    ];

    const store = getStore();
    await store.dispatch(fetch());
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('unsuccessful - creates EXCEPTIONS_ERROR', async (done: any) => {
    mockHttp.onGet('/migrator/errors').replyOnce(500, {});

    const expectedActions = [
      { type: types.EXCEPTIONS_REQUEST },
      {
        type: types.EXCEPTIONS_ERROR,
        payload: {
          error: { status: 500 },
        },
        meta: { redirectableError: true },
      },
    ];

    const store = getStore();
    await store.dispatch(fetch());
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
