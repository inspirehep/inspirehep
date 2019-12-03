import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router';

import reducer, {
  initialState,
  AUTHORS_NS,
  LITERATURE_NS,
  SEARCH_BOX_NAMESPACES,
  JOBS_NS,
  AUTHOR_PUBLICATIONS_NS,
} from '../search';
import * as types from '../../actions/actionTypes';

describe('search reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('LOCATION_CHANGE authors', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: '/authors/12345' },
      },
    });
    expect(state.get('searchBoxNamespace')).toEqual(AUTHORS_NS);
  });

  it('LOCATION_CHANGE literature', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: '/literature?q=CERN' },
      },
    });
    expect(state.get('searchBoxNamespace')).toEqual(LITERATURE_NS);
  });

  it('LOCATION_CHANGE something else', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: '/something/else' },
      },
    });
    expect(state.get('searchBoxNamespace')).toEqual(LITERATURE_NS);
  });

  it('CHANGE_SEARCH_BOX_NAMESPACE', () => {
    const aNamespace = SEARCH_BOX_NAMESPACES[0];
    const state = reducer(Map(), {
      type: types.CHANGE_SEARCH_BOX_NAMESPACE,
      payload: { searchBoxNamespace: aNamespace },
    });
    expect(state.get('searchBoxNamespace')).toEqual(aNamespace);
  });

  it('NEW_SEARCH_REQUEST', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialAggregations: { initAggs: {} },
          query: { q: 'dude', page: 3 },
          persistedQueryParamsDuringNewSearch: [],
        },
      },
    });
    const state = reducer(initialReducerState, {
      type: types.NEW_SEARCH_REQUEST,
      payload: { namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          initialAggregations: initialState.getIn([
            'namespaces',
            namespace,
            'initialAggregations',
          ]),
          query: initialState.getIn(['namespaces', namespace, 'query']),
          persistedQueryParamsDuringNewSearch: [],
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('NEW_SEARCH_REQUEST with persistedQueryParamsDuringNewSearch', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialAggregations: { initAggs: {} },
          query: { q: 'dude', page: 3, a: '1', b: '2' },
          persistedQueryParamsDuringNewSearch: ['a', 'b'],
        },
      },
    });
    const state = reducer(initialReducerState, {
      type: types.NEW_SEARCH_REQUEST,
      payload: { namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          initialAggregations: initialState.getIn([
            'namespaces',
            namespace,
            'initialAggregations',
          ]),
          query: {
            ...initialState.getIn(['namespaces', namespace, 'query']).toJS(),
            a: '1',
            b: '2',
          },
          persistedQueryParamsDuringNewSearch: ['a', 'b'],
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_QUERY_UPDATE', () => {
    const namespace = LITERATURE_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          baseQuery: { sort: 'mostrecent', q: '' },
          query: { q: 'test', page: 2 },
        },
      },
    });
    const query = { page: 1, size: 99 };

    const state = reducer(initialReducerState, {
      type: types.SEARCH_QUERY_UPDATE,
      payload: { namespace, query },
    });

    const expected = fromJS({
      namespaces: {
        [namespace]: {
          baseQuery: { sort: 'mostrecent', q: '' },
          query: {
            q: 'test',
            page: 1,
            sort: 'mostrecent',
            size: 99,
          },
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_QUERY_RESET', () => {
    const namespace = LITERATURE_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          query: { q: 'test', page: 2 },
        },
      },
    });

    const state = reducer(initialReducerState, {
      type: types.SEARCH_QUERY_RESET,
      payload: { namespace },
    });

    const expected = fromJS({
      namespaces: {
        [namespace]: {
          query: initialState.getIn(['namespaces', namespace, 'query']),
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_BASE_QUERIES_UPDATE', () => {
    const namespace = LITERATURE_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          baseAggregationsQuery: { facet_name: 'first' },
          baseQuery: { sort: 'mostrecent' },
          query: { sort: 'mostrecent', page: 1 },
        },
      },
    });
    const baseQuery = { sort: 'mostcited' };
    const baseAggregationsQuery = { facet_name: 'second' };

    const state = reducer(initialReducerState, {
      type: types.SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseQuery, baseAggregationsQuery },
    });

    const expected = fromJS({
      namespaces: {
        [namespace]: {
          baseQuery: { sort: 'mostcited' },
          baseAggregationsQuery: { facet_name: 'second' },
          query: {
            sort: 'mostcited',
            page: 1,
          },
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_REQUEST', () => {
    const namespace = JOBS_NS;
    const state = reducer(Map(), {
      type: types.SEARCH_REQUEST,
      payload: { namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loading: true,
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_SUCCESS', () => {
    const namespace = JOBS_NS;
    const data = {
      hits: {
        hits: ['found'],
        total: 1,
      },
      sort_options: [{ value: 'mostrecent', display: 'Most Recent' }],
    };
    const state = reducer(Map(), {
      type: types.SEARCH_SUCCESS,
      payload: { namespace, data },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loading: false,
          total: data.hits.total,
          sortOptions: data.sort_options,
          results: data.hits.hits,
          error: initialState.getIn(['namespaces', namespace, 'error']),
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_ERROR', () => {
    const namespace = AUTHORS_NS;
    const error = { message: 'error' };
    const state = reducer(Map(), {
      type: types.SEARCH_ERROR,
      payload: { error, namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loading: false,
          error,
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_AGGREGATIONS_ERROR', () => {
    const namespace = AUTHORS_NS;
    const error = { message: 'error' };
    const state = reducer(Map(), {
      type: types.SEARCH_AGGREGATIONS_ERROR,
      payload: { error, namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loadingAggregations: false,
          aggregationsError: { message: 'error' },
          aggregations: initialState.getIn([
            'namespaces',
            namespace,
            'aggregations',
          ]),
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_AGGREGATIONS_REQUEST', () => {
    const namespace = LITERATURE_NS;
    const state = reducer(Map(), {
      type: types.SEARCH_AGGREGATIONS_REQUEST,
      payload: { namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loadingAggregations: true,
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_AGGREGATIONS_SUCCESS when initialAggregations is empty', () => {
    const namespace = LITERATURE_NS;
    const data = {
      aggregations: {
        agg1: {},
      },
    };
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialAggregations: {},
        },
      },
    });
    const state = reducer(initialReducerState, {
      type: types.SEARCH_AGGREGATIONS_SUCCESS,
      payload: { data, namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loadingAggregations: false,
          initialAggregations: data.aggregations,
          aggregations: data.aggregations,
          aggregationsError: initialState.getIn([
            'namespaces',
            namespace,
            'aggregationsError',
          ]),
        },
      },
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_AGGREGATIONS_SUCCESS when initialAggregations is not empty', () => {
    const namespace = LITERATURE_NS;
    const data = {
      aggregations: {
        agg1: {},
      },
    };
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialAggregations: { initAggs: {} },
        },
      },
    });
    const state = reducer(initialReducerState, {
      type: types.SEARCH_AGGREGATIONS_SUCCESS,
      payload: { data, namespace },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          loadingAggregations: false,
          initialAggregations: { initAggs: {} },
          aggregations: data.aggregations,
          aggregationsError: initialState.getIn([
            'namespaces',
            namespace,
            'aggregationsError',
          ]),
        },
      },
    });
    expect(state).toEqual(expected);
  });
});
