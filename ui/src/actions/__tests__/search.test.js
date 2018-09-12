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
const stateWithScopeQuery = {
  search: fromJS({
    scope: {
      pathname: 'test',
      query: {
        size: 10,
      },
    },
  }),
};

const stateWithoutScopeQuery = {
  search: fromJS({
    scope: {
      pathname: 'test',
      query: {},
    },
  }),
};

describe('search - action creators', () => {
  describe('searchForCurrentLocation', () => {
    it('create SEARCH_REQUEST and SEARCH_SUCCESS if search request is successful', async done => {
      const store = getStoreWithState({
        router: {
          location: { pathname: '/test', search: '?size=10&q=test' },
        },
      });
      mockHttp.onGet('/test?size=10&q=test').replyOnce(200, { foo: 'bar' });

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
          location: { pathname: '/test', search: '?size=10&q=test' },
        },
      });
      mockHttp.onGet('/test?size=10&q=test').networkError();

      await store.dispatch(searchForCurrentLocation());

      const expectedActions = [
        { type: types.SEARCH_REQUEST },
        { type: types.SEARCH_ERROR, payload: undefined },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('fetchSearchAggregationsForCurrentLocation', () => {
    it('creates SEARCH_AGGREGATIONS_REQUEST and SEARCH_AGGREGATIONS_SUCCESS if search request is successful', async done => {
      const store = getStoreWithState({
        router: {
          location: { pathname: '/test', search: '?size=10&q=test' },
        },
      });
      mockHttp
        .onGet('/test/facets?size=10&q=test')
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
          location: { pathname: '/test', search: '?size=10&q=test' },
        },
      });
      mockHttp.onGet('/test/facets?size=10&q=test').networkError();

      await store.dispatch(fetchSearchAggregationsForCurrentLocation());

      const expectedActions = [
        { type: types.SEARCH_AGGREGATIONS_REQUEST },
        { type: types.SEARCH_AGGREGATIONS_ERROR, payload: undefined },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('pushQueryToLocation', () => {
    it('pushes new location url to history', async done => {
      const expectedUrl = '/test?size=10&q=test';
      const expectedActions = [
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: [expectedUrl], method: 'push' },
        },
      ];

      const store = getStoreWithState(stateWithScopeQuery);
      await store.dispatch(pushQueryToLocation({ q: 'test' }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('pushes new location url to history (without search scope)', async done => {
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

    it('resets page to if it is defined then pushes new location url to history', async done => {
      const expectedUrl = '/test?page=1&q=test';
      const expectedActions = [
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: [expectedUrl], method: 'push' },
        },
      ];

      const state = {
        ...stateWithoutScopeQuery,
        router: { location: { query: { page: 2 } } },
      };

      const store = getStoreWithState(state);
      await store.dispatch(pushQueryToLocation({ q: 'test' }));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('uses page from query over page=1 if it is defined in location then pushes new location url to history', async done => {
      const expectedUrl = '/test?page=3';
      const expectedActions = [
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: [expectedUrl], method: 'push' },
        },
      ];

      const state = {
        ...stateWithoutScopeQuery,
        router: { location: { query: { page: 2 } } },
      };

      const store = getStoreWithState(state);
      await store.dispatch(pushQueryToLocation({ page: 3 }));
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

    it('takes priority on query over location query over scope query new location url to history', async done => {
      const scopeQuery = {
        filter1: 'scope1',
        filter2: 'scope2',
        filter3: 'scope3',
      };
      const locationQuery = {
        filter2: 'location2',
        filter4: 'location4',
      };
      const query = {
        filter3: 'query3',
        filter4: 'query4',
      };

      const expectedUrl =
        '/test?filter1=scope1&filter2=location2&filter3=query3&filter4=query4';
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
            query: scopeQuery,
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
