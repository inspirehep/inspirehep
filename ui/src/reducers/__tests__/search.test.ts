import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router';

import reducer, { initialState } from '../search';
import {
  AUTHORS_NS,
  LITERATURE_NS,
  SEARCH_BOX_NAMESPACES,
  JOBS_NS,
  AUTHOR_PUBLICATIONS_NS,
} from '../../search/constants';
import searchConfig from '../../search/config';
import * as types from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('search reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LOCATION_CHANGE authors', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: '/authors/12345' },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('searchBoxNamespace')).toEqual(AUTHORS_NS);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LOCATION_CHANGE literature', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: '/literature?q=CERN' },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('searchBoxNamespace')).toEqual(LITERATURE_NS);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LOCATION_CHANGE something else', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: '/something/else' },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('searchBoxNamespace')).toEqual(LITERATURE_NS);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CHANGE_SEARCH_BOX_NAMESPACE', () => {
    const aNamespace = SEARCH_BOX_NAMESPACES[0];
    const state = reducer(Map(), {
      type: types.CHANGE_SEARCH_BOX_NAMESPACE,
      payload: { searchBoxNamespace: aNamespace },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('searchBoxNamespace')).toEqual(aNamespace);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('NEW_SEARCH_REQUEST', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const { persistedQueryParamsDuringNewSearch } = searchConfig[namespace];
    const aPersistedParam = persistedQueryParamsDuringNewSearch[0];
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialTotal: 34,
          initialAggregations: { initAggs: {} },
          query: {
            notPersisted: 'will be deleted',
            [aPersistedParam]: 'will be kept',
          },
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
          initialTotal: initialState.getIn([
            'namespaces',
            namespace,
            'initialTotal',
          ]),
          initialAggregations: initialState.getIn([
            'namespaces',
            namespace,
            'initialAggregations',
          ]),
          query: {
            ...initialState.getIn(['namespaces', namespace, 'query']).toJS(),
            [aPersistedParam]: 'will be kept',
          },
        },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH_BASE_QUERIES_UPDATE with only baseQuery', () => {
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

    const state = reducer(initialReducerState, {
      type: types.SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseQuery },
    });

    const expected = fromJS({
      namespaces: {
        [namespace]: {
          baseQuery: { sort: 'mostcited' },
          baseAggregationsQuery: { facet_name: 'first' },
          query: {
            sort: 'mostcited',
            page: 1,
          },
        },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH_SUCCESS when initial total is not set', () => {
    const namespace = JOBS_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialTotal: null,
        },
      },
    });
    const data = {
      hits: {
        hits: ['found'],
        total: 1,
      },
      sort_options: [{ value: 'mostrecent', display: 'Most Recent' }],
    };
    const state = reducer(initialReducerState, {
      type: types.SEARCH_SUCCESS,
      payload: { namespace, data },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          initialTotal: 1,
          loading: false,
          total: data.hits.total,
          sortOptions: data.sort_options,
          results: data.hits.hits,
          error: initialState.getIn(['namespaces', namespace, 'error']),
        },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH_SUCCESS when initial total is set', () => {
    const namespace = JOBS_NS;
    const initialReducerState = fromJS({
      namespaces: {
        [namespace]: {
          initialTotal: 5,
        },
      },
    });
    const data = {
      hits: {
        hits: ['found'],
        total: 1,
      },
      sort_options: [{ value: 'mostrecent', display: 'Most Recent' }],
    };
    const state = reducer(initialReducerState, {
      type: types.SEARCH_SUCCESS,
      payload: { namespace, data },
    });
    const expected = fromJS({
      namespaces: {
        [namespace]: {
          initialTotal: 5,
          loading: false,
          total: data.hits.total,
          sortOptions: data.sort_options,
          results: data.hits.hits,
          error: initialState.getIn(['namespaces', namespace, 'error']),
        },
      },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });
});
