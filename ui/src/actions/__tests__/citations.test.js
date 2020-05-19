import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import {
  fetchCitations,
  fetchCitationSummary,
  fetchCitationsByYear,
} from '../citations';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';
import { LITERATURE } from '../../common/routes';

const mockHttp = new MockAdapter(http);

describe('citations - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('creates CITATIONS_SUCCESS if successful', async done => {
    mockHttp
      .onGet('/literature/123/citations?page=1&size=10')
      .replyOnce(200, { foo: 'bar' });

    const expectedActions = [
      { type: types.CITATIONS_REQUEST, payload: { page: 1, size: 10 } },
      { type: types.CITATIONS_SUCCESS, payload: { foo: 'bar' } },
    ];

    const store = getStore();
    await store.dispatch(fetchCitations(123, { page: 1, size: 10 }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('fetches citations with merging the given query into the existing one ', async done => {
    mockHttp
      .onGet('/literature/123/citations?size=10&page=10&q=dude&sort=mostrecent')
      .replyOnce(200, {});

    const expectedActions = [
      {
        type: types.CITATIONS_REQUEST,
        payload: { size: 10, page: 10, q: 'dude', sort: 'mostrecent' },
      },
      { type: types.CITATIONS_SUCCESS, payload: {} },
    ];

    const store = getStoreWithState({
      citations: fromJS({
        query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
      }),
    });
    await store.dispatch(fetchCitations(123, { page: 10 }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates CITATIONS_ERROR if unsuccessful', async done => {
    mockHttp.onGet('/literature/123/citations?page=2&size=10').replyOnce(500);

    const expectedActions = [
      { type: types.CITATIONS_REQUEST, payload: { page: 2, size: 10 } },
      { type: types.CITATIONS_ERROR, payload: { error: { status: 500 } } },
    ];

    const store = getStore();
    await store.dispatch(fetchCitations(123, { page: 2, size: 10 }));
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates CITATIONS_SUMMARY_SUCCESS if successful', async done => {
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
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates CITATIONS_SUMMARY_ERROR if unsuccessful', async done => {
    const query = { q: 'stuff' };
    const excludeSelfCitations = true;
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
      ui: fromJS({
        excludeSelfCitations,
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
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates CITATIONS_BY_YEAR_SUCCESS if successful', async done => {
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
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });

  it('creates CITATIONS_BY_YEAR_ERROR if unsuccessful', async done => {
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
    expect(store.getActions()).toEqual(expectedActions);
    done();
  });
});
