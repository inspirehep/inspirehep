import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import * as types from '../actionTypes';
import { fetchCitationSummary, fetchCitationsByYear } from '../citations';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';
import { LITERATURE } from '../../common/routes';
import { EXCLUDE_SELF_CITATIONS_PREFERENCE } from '../../reducers/user';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('citations - async action creator', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    mockHttp.reset();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates CITATIONS_SUMMARY_SUCCESS if successful', async (done: any) => {
    const query = { author: ['12345_Jared'] };
    const excludeSelfCitations = false;
    const namespace = AUTHOR_PUBLICATIONS_NS;
    mockHttp
      .onGet(
        '/literature/facets?author=12345_Jared&facet_name=citation-summary'
      )
      .replyOnce(200, { foo: 'bar' });

    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query,
          },
        },
      }),
      ui: fromJS({
        excludeSelfCitations,
      }),
    });

    const expectedActions = [
      {
        type: types.CITATIONS_SUMMARY_REQUEST,
        payload: { namespace },
      },
      { type: types.CITATIONS_SUMMARY_SUCCESS, payload: { foo: 'bar' } },
    ];

    await store.dispatch(fetchCitationSummary(namespace));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates CITATIONS_SUMMARY_ERROR if unsuccessful', async (done: any) => {
    const query = { q: 'stuff' };
    const namespace = LITERATURE;

    mockHttp
      .onGet(
        '/literature/facets?q=stuff&facet_name=citation-summary&exclude-self-citations=true'
      )
      .replyOnce(404, { message: 'Error' });

    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query,
          },
        },
      }),
      user: fromJS({
        preferences: {
          [EXCLUDE_SELF_CITATIONS_PREFERENCE]: true,
        },
      }),
    });

    const expectedActions = [
      {
        type: types.CITATIONS_SUMMARY_REQUEST,
        payload: { namespace },
      },
      {
        type: types.CITATIONS_SUMMARY_ERROR,
        payload: {
          error: { status: 404, message: 'Error' },
        },
      },
    ];

    await store.dispatch(fetchCitationSummary(namespace));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates CITATIONS_BY_YEAR_SUCCESS if successful', async (done: any) => {
    mockHttp
      .onGet(
        '/literature/facets?author=12345_Jared&facet_name=citations-by-year'
      )
      .replyOnce(200, { foo: 'bar' });

    const expectedActions = [
      { type: types.CITATIONS_BY_YEAR_REQUEST },
      { type: types.CITATIONS_BY_YEAR_SUCCESS, payload: { foo: 'bar' } },
    ];

    const store = getStore();
    await store.dispatch(
      fetchCitationsByYear({
        author: ['12345_Jared'],
      })
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates CITATIONS_BY_YEAR_ERROR if unsuccessful', async (done: any) => {
    mockHttp
      .onGet('/literature/facets?q=stuff&facet_name=citations-by-year')
      .replyOnce(404, { message: 'Error' });

    const expectedActions = [
      { type: types.CITATIONS_BY_YEAR_REQUEST },
      {
        type: types.CITATIONS_BY_YEAR_ERROR,
        payload: {
          error: { status: 404, message: 'Error' },
        },
      },
    ];

    const store = getStore();
    await store.dispatch(
      fetchCitationsByYear({
        q: 'stuff',
      })
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
