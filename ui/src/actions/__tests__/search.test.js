import { push, replace } from 'connected-react-router';
import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import {
  searchForCurrentQuery,
  fetchSearchAggregationsForCurrentQuery,
  changeSearchBoxNamespace,
  searchBaseQueriesUpdate,
  searchQueryUpdate,
  newSearch,
} from '../search';
import {
  LITERATURE_NS,
  AUTHOR_PUBLICATIONS_NS,
  FETCH_MODE_ALWAYS,
  AUTHORS_NS,
  FETCH_MODE_NEVER,
  FETCH_MODE_INITIAL,
  JOBS_NS,
} from '../../reducers/search';
import { LITERATURE, AUTHORS, JOBS } from '../../common/routes';

const mockHttp = new MockAdapter(http);

describe('search - action creators', () => {
  describe('searchForCurrentQuery', () => {
    it('creates SEARCH_REQUEST SEARCH_SUCCESS if search request is successful and pushes search url to history if search namespace is not embedded', async () => {
      const namespace = LITERATURE_NS;
      const pathname = LITERATURE;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: false,
            },
          },
        }),
      });
      const data = { foo: 'bar' };
      const url = `${pathname}?page=1&size=10&q=test`;
      mockHttp.onGet(url).replyOnce(200, data);

      await store.dispatch(searchForCurrentQuery(namespace));

      const expectedActions = [
        { type: types.SEARCH_REQUEST, payload: { namespace } },
        push(url),
        { type: types.SEARCH_SUCCESS, payload: { namespace, data } },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates SEARCH_REQUEST SEARCH_SUCCESS if search request is successful and replaces search url in history when only difference between current url and searcn query is the baseQuery, if search namespace is embeded,', async () => {
      const namespace = LITERATURE_NS;
      const pathname = LITERATURE;
      const store = getStoreWithState({
        router: {
          location: {
            query: { q: 'test' },
          },
        },
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: false,
            },
          },
        }),
      });
      const data = { foo: 'bar' };
      const url = `${pathname}?page=1&size=10&q=test`;
      mockHttp.onGet(url).replyOnce(200, data);

      await store.dispatch(searchForCurrentQuery(namespace));

      const expectedActions = [
        { type: types.SEARCH_REQUEST, payload: { namespace } },
        replace(url),
        { type: types.SEARCH_SUCCESS, payload: { namespace, data } },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates SEARCH_REQUEST and SEARCH_ERROR if search request is unsuccessful', async () => {
      const namespace = AUTHOR_PUBLICATIONS_NS;
      const pathname = LITERATURE;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: true,
            },
          },
        }),
      });
      mockHttp.onGet(`${pathname}?page=1&size=10&q=test`).networkError();

      await store.dispatch(searchForCurrentQuery(namespace));

      const expectedActions = [
        { type: types.SEARCH_REQUEST, payload: { namespace } },
        {
          type: types.SEARCH_ERROR,
          payload: { namespace, error: { status: 'network' } },
          meta: { redirectableError: true }, // TODO: should this be redirectableError?
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchSearchAggregationsForCurrentQuery', () => {
    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_SUCCESS if search request is successful when aggregationsFetchMode is ALWAYS', async () => {
      const namespace = AUTHOR_PUBLICATIONS_NS;
      const pathname = LITERATURE;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: true,
              aggregationsFetchMode: FETCH_MODE_ALWAYS,
              baseAggregationsQuery: { facet_name: 'pubs' },
              aggregations: {},
            },
          },
        }),
      });
      const data = { foo: 'bar' };
      mockHttp
        .onGet(`${pathname}/facets?page=1&size=10&q=test&facet_name=pubs`)
        .replyOnce(200, data);

      await store.dispatch(fetchSearchAggregationsForCurrentQuery(namespace));

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST, payload: { namespace } },
        {
          type: types.SEARCH_AGGREGATIONS_SUCCESS,
          payload: { namespace, data },
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('does not create SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_SUCCESS if search request is successful when aggregationsFetchMode is NEVER', async () => {
      const namespace = AUTHORS_NS;
      const pathname = AUTHORS;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: false,
              aggregationsFetchMode: FETCH_MODE_NEVER,
              aggregations: {},
            },
          },
        }),
      });

      await store.dispatch(fetchSearchAggregationsForCurrentQuery(namespace));

      const expectedActions = [];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates SEARCH_AGGREGATIONS_REQUEST without query and SEARCH_AGGREGATIONS_SUCCESS if search request is successful when aggregationsFetchMode is INITIAL and aggregations is empty', async () => {
      const namespace = JOBS_NS;
      const pathname = JOBS;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: false,
              aggregationsFetchMode: FETCH_MODE_INITIAL,
              baseAggregationsQuery: {},
              aggregations: {},
            },
          },
        }),
      });
      const data = { foo: 'bar' };
      mockHttp.onGet(`${pathname}/facets?`).replyOnce(200, data);

      await store.dispatch(fetchSearchAggregationsForCurrentQuery(namespace));

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST, payload: { namespace } },
        {
          type: types.SEARCH_AGGREGATIONS_SUCCESS,
          payload: { namespace, data },
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('does not create SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_SUCCESS if search request is successful when aggregationsFetchMode is INITIAL and aggregations is not empty', async () => {
      const namespace = AUTHORS_NS;
      const pathname = AUTHORS;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: false,
              aggregationsFetchMode: FETCH_MODE_INITIAL,
              aggregations: { foo: 'bar' },
            },
          },
        }),
      });

      await store.dispatch(fetchSearchAggregationsForCurrentQuery(namespace));

      const expectedActions = [];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_ERROR if search request is unsuccessful', async () => {
      const namespace = LITERATURE_NS;
      const pathname = LITERATURE;
      const store = getStoreWithState({
        search: fromJS({
          namespaces: {
            [namespace]: {
              pathname,
              query: { page: 1, size: 10, q: 'test' },
              baseQuery: { page: 1, size: 10 },
              embedded: false,
              baseAggregationsQuery: {},
              aggregationsFetchMode: FETCH_MODE_ALWAYS,
              aggregations: {},
            },
          },
        }),
      });
      mockHttp
        .onGet(`${pathname}/facets?page=1&size=10&q=test`)
        .replyOnce(400, { message: 'error' });

      await store.dispatch(fetchSearchAggregationsForCurrentQuery(namespace));

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST, payload: { namespace } },
        {
          type: types.SEARCH_AGGREGATIONS_ERROR,
          payload: { error: { message: 'error', status: 400 }, namespace },
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('changeSearchBoxNamespace', () => {
    it('creates CHANGE_SEARCH_BOX_NAMESPACE', async () => {
      const store = getStore();

      store.dispatch(changeSearchBoxNamespace('test'));

      const expectedActions = [
        {
          type: types.CHANGE_SEARCH_BOX_NAMESPACE,
          payload: { searchBoxNamespace: 'test' },
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('searchBaseQueriesUpdate', () => {
    it('creates SEARCH_BASE_QUERIES_UPDATE', async () => {
      const store = getStore();
      const namespace = LITERATURE_NS;
      const baseAggregationsQuery = { foo: 'bar' };
      const baseQuery = { bar: 'baz' };
      store.dispatch(
        searchBaseQueriesUpdate(namespace, { baseQuery, baseAggregationsQuery })
      );

      const expectedActions = [
        {
          type: types.SEARCH_BASE_QUERIES_UPDATE,
          payload: { namespace, baseQuery, baseAggregationsQuery },
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('searchQueryUpdate', () => {
    it('creates SEARCH_QUERY_UPDATE', async () => {
      const store = getStore();
      const namespace = LITERATURE_NS;
      const query = { foo: 'bar' };
      store.dispatch(searchQueryUpdate(namespace, query));

      const expectedActions = [
        {
          type: types.SEARCH_QUERY_UPDATE,
          payload: { namespace, query },
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('newSearch', () => {
    it('creates SEARCH_QUERY_UPDATE', async () => {
      const store = getStore();
      const namespace = LITERATURE_NS;
      store.dispatch(newSearch(namespace));

      const expectedActions = [
        {
          type: types.NEW_SEARCH_REQUEST,
          payload: { namespace },
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
