import { CALL_HISTORY_METHOD } from 'react-router-redux';
import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../fixtures/store';
import http from '../../common/http';
import * as types from '../actionTypes';
import {
  pushQueryToLocation,
  searchForCurrentLocation,
  changeSearchScope,
  fetchSearchAggregationsForCurrentLocation,
} from '../search';

const mockHttp = new MockAdapter(http);

const stateWithoutScopeQuery = {
  search: fromJS({
    scope: {
      pathname: 'test',
      query: {},
    },
  }),
  router: {
    location: {
      query: {},
      previousUrl: '',
    },
  },
};

describe('search - action creators', () => {
  describe('searchForCurrentLocation', () => {
    it('create SEARCH_REQUEST and SEARCH_SUCCESS if search request is successful', async done => {
      const store = getStoreWithState({
        router: {
          location: { pathname: '/test', query: { size: '10', q: 'test' } },
        },
        search: fromJS({
          scope: {
            pathname: 'test',
            query: {
              page: '1',
            },
          },
        }),
      });
      mockHttp
        .onGet('/test?page=1&size=10&q=test')
        .replyOnce(200, { foo: 'bar' });

      await store.dispatch(searchForCurrentLocation());

      const expectedActions = [
        { type: types.SEARCH_REQUEST },
        { type: types.SEARCH_SUCCESS, payload: { foo: 'bar' } },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('create SEARCH_REQUEST and SEARCH_ERROR if search request is unsuccessful', async done => {
      const store = getStoreWithState({
        router: {
          location: { pathname: '/test', query: { size: '10', q: 'test' } },
        },
        search: fromJS({
          scope: {
            pathname: 'test',
            query: {
              page: '1',
            },
          },
        }),
      });
      mockHttp.onGet('/test?page=1&size=10&q=test').networkError();

      await store.dispatch(searchForCurrentLocation());

      const expectedActions = [
        { type: types.SEARCH_REQUEST },
        {
          type: types.SEARCH_ERROR,
          payload: { status: 'network' },
          meta: { redirectableError: true },
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('fetchSearchAggregationsForCurrentLocation', () => {
    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_SUCCESS if search request is successful', async done => {
      const store = getStoreWithState({
        router: {
          location: { pathname: '/test', query: { size: '10', q: 'test' } },
        },
        search: fromJS({
          scope: {
            pathname: 'test',
            query: {
              page: '1',
            },
          },
        }),
      });
      mockHttp
        .onGet('/test/facets?page=1&size=10&q=test')
        .replyOnce(200, { foo: 'bar' });

      await store.dispatch(fetchSearchAggregationsForCurrentLocation());

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST },
        { type: types.SEARCH_AGGREGATIONS_SUCCESS, payload: { foo: 'bar' } },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_ERROR if search request is unsuccessful', async done => {
      const store = getStoreWithState({
        router: {
          location: { pathname: '/test', query: { size: '10', q: 'test' } },
        },
        search: fromJS({
          scope: {
            pathname: 'test',
            query: {
              page: '1',
            },
          },
        }),
      });
      mockHttp
        .onGet('/test/facets?page=1&size=10&q=test')
        .replyOnce(400, { message: 'error' });

      await store.dispatch(fetchSearchAggregationsForCurrentLocation());

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST },
        {
          type: types.SEARCH_AGGREGATIONS_ERROR,
          payload: { message: 'error' },
        },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('pushQueryToLocation', () => {
    it('pushes new location url with query to history', async done => {
      const expectedUrl = '/test?q=test';
      const expectedActions = [
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: [expectedUrl], method: 'push' },
        },
      ];

      const store = getStoreWithState(stateWithoutScopeQuery);
      await store.dispatch(pushQueryToLocation({ q: 'test' }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('does not push to history if new location query is empty', async done => {
      const expectedActions = [];
      const store = getStoreWithState(stateWithoutScopeQuery);
      await store.dispatch(pushQueryToLocation({}));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('excludes location query if flag is set then pushes new location url to history', async done => {
      const expectedUrl = '/test?filter2=value2';
      const expectedActions = [
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: [expectedUrl], method: 'push' },
        },
      ];

      const state = {
        ...stateWithoutScopeQuery,
        router: { location: { query: { filter1: 'value1' } } },
      };

      const store = getStoreWithState(state);
      await store.dispatch(pushQueryToLocation({ filter2: 'value2' }, true));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('overrides current location with new query', async done => {
      const locationQuery = {
        filter1: 'location1',
        filter2: 'location2',
      };
      const query = {
        filter2: 'query2',
        filter3: 'query3',
      };

      const expectedUrl =
        '/test?filter1=location1&filter2=query2&filter3=query3';
      const expectedActions = [
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: [expectedUrl], method: 'push' },
        },
      ];

      const state = {
        search: fromJS({
          scope: {
            pathname: 'test',
          },
        }),
        router: { location: { query: locationQuery } },
      };

      const store = getStoreWithState(state);
      await store.dispatch(pushQueryToLocation(query));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('changeSearchScope', () => {
    it('creates CHANGE_SEARCH_SCOPE', async done => {
      const store = getStore();

      await store.dispatch(changeSearchScope('test'));

      const expectedActions = [
        { type: types.CHANGE_SEARCH_SCOPE, payload: 'test' },
      ];

      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
