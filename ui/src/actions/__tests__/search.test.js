import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http.ts';
import * as types from '../actionTypes';
import {
  fetchSearchResults,
  fetchSearchAggregations,
  changeSearchBoxNamespace,
  searchBaseQueriesUpdate,
  searchQueryUpdate,
  newSearch,
} from '../search';
import { LITERATURE_NS, AUTHOR_PUBLICATIONS_NS } from '../../search/constants';
import { LITERATURE } from '../../common/routes';
import searchConfig from '../../search/config';

jest.mock('../../search/config');

const mockHttp = new MockAdapter(http.httpClient);

describe('search - action creators', () => {
  describe('fetchSearchResults', () => {
    it('creates SEARCH_REQUEST and SEARCH_SUCCESS', async () => {
      const namespace = LITERATURE_NS;
      const pathname = LITERATURE;
      const store = getStore();
      const data = { foo: 'bar' };
      const url = `${pathname}?page=1&size=10&q=test`;
      mockHttp.onGet(url).replyOnce(200, data);

      await store.dispatch(fetchSearchResults(namespace, url));

      const expectedActions = [
        { type: types.SEARCH_REQUEST, payload: { namespace } },
        { type: types.SEARCH_SUCCESS, payload: { namespace, data } },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates SEARCH_REQUEST and SEARCH_ERROR if search request is unsuccessful', async () => {
      const namespace = AUTHOR_PUBLICATIONS_NS;
      const pathname = LITERATURE;
      const store = getStore();
      const url = `${pathname}?page=1&size=10&q=test`;
      mockHttp.onGet(`${pathname}?page=1&size=10&q=test`).networkError();

      await store.dispatch(fetchSearchResults(namespace, url));

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

  describe('fetchSearchAggregations', () => {
    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_SUCCESS if search request is successful', async () => {
      const namespace = AUTHOR_PUBLICATIONS_NS;
      const pathname = LITERATURE;
      const store = getStore();
      const data = { foo: 'bar' };
      const url = `${pathname}/facets?page=1&size=10&q=test&facet_name=pubs`;
      mockHttp.onGet(url).replyOnce(200, data);

      await store.dispatch(fetchSearchAggregations(namespace, url));

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST, payload: { namespace } },
        {
          type: types.SEARCH_AGGREGATIONS_SUCCESS,
          payload: { namespace, data },
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_ERROR if search request is unsuccessful', async () => {
      const namespace = LITERATURE_NS;
      const pathname = LITERATURE;
      const store = getStore();
      const url = `${pathname}/facets?page=1&size=10&q=test`;
      mockHttp.onGet(url).replyOnce(400, { message: 'error' });

      await store.dispatch(fetchSearchAggregations(namespace, url));

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

      expect(searchConfig[namespace].onQueryChange).toHaveBeenCalled();

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('searchQueryUpdate', () => {
    it('creates SEARCH_QUERY_UPDATE', async () => {
      const store = getStore();
      const namespace = AUTHOR_PUBLICATIONS_NS;
      const query = { foo: 'bar' };
      store.dispatch(searchQueryUpdate(namespace, query));

      const expectedActions = [
        {
          type: types.SEARCH_QUERY_UPDATE,
          payload: { namespace, query },
        },
      ];

      // TODO: assert parameters
      expect(searchConfig[namespace].onQueryChange).toHaveBeenCalled();

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
