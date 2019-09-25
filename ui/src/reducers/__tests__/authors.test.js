import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../authors';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  CLEAR_STATE,
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_SUCCESS,
  AUTHOR_PUBLICATIONS_ERROR,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
  AUTHOR_PUBLICATIONS_FACETS_ERROR,
} from '../../actions/actionTypes';

describe('authors reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('CLEAR_STATE', () => {
    const currentState = fromJS({
      data: {
        control_number: 123456,
      },
      publications: {
        query: { page: 5 },
        results: [{ control_number: 32134 }],
        aggregations: { agg1: { foo: 'bar' } },
      },
    });
    const state = reducer(currentState, { type: CLEAR_STATE });
    expect(state).toEqual(initialState);
  });

  it('AUTHOR_REQUEST', () => {
    const state = reducer(Map(), { type: AUTHOR_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_SUCCESS', () => {
    const payload = {
      metadata: {
        name: [
          {
            value: 'Jessica Jones',
          },
        ],
        facet_author_name: 'Jessica.J.1',
      },
    };
    const state = reducer(Map(), { type: AUTHOR_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: initialState.get('error'),
      publications: {
        query: { author: ['Jessica.J.1'] },
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_ERROR', () => {
    const state = reducer(Map(), {
      type: AUTHOR_ERROR,
      payload: { message: 'error' },
    });
    const expected = fromJS({
      loading: false,
      error: { message: 'error' },
      data: initialState.get('data'),
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_REQUEST', () => {
    const payload = { foo: 'bar' };
    const state = reducer(Map(), {
      type: AUTHOR_PUBLICATIONS_REQUEST,
      payload,
    });
    const expected = fromJS({
      publications: {
        loadingResults: true,
        query: payload,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_SUCCESS', () => {
    const payload = {
      hits: {
        hits: [
          {
            value: 'Publication',
          },
        ],
        total: 5,
      },
      sort_options: [{ value: 'mostrecent', display: 'Most Recent' }],
    };
    const state = reducer(Map(), {
      type: AUTHOR_PUBLICATIONS_SUCCESS,
      payload,
    });
    const expected = fromJS({
      publications: {
        results: payload.hits.hits,
        total: payload.hits.total,
        sortOptions: payload.sort_options,
        error: initialState.getIn(['publications', 'error']),
        loadingResults: false,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_ERROR', () => {
    const state = reducer(Map(), {
      type: AUTHOR_PUBLICATIONS_ERROR,
      payload: { message: 'error' },
    });
    const expected = fromJS({
      publications: {
        results: initialState.getIn(['publications', 'results']),
        total: initialState.getIn(['publications', 'total']),
        sortOptions: initialState.getIn(['publications', 'sortOptions']),
        error: { message: 'error' },
        loadingResults: false,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_FACETS_REQUEST', () => {
    const payload = { foo: 'bar' };
    const state = reducer(Map(), {
      type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
      payload,
    });
    const expected = fromJS({
      publications: {
        loadingAggregations: true,
        query: payload,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_FACETS_SUCCESS when initialAggregations is empty', () => {
    const payload = {
      aggregations: { agg1: { foo: 'bar' } },
    };
    const state = reducer(
      fromJS({ publications: { initialAggregations: {} } }),
      {
        type: AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
        payload,
      }
    );
    const expected = fromJS({
      publications: {
        aggregations: payload.aggregations,
        initialAggregations: payload.aggregations,
        error: initialState.getIn(['publications', 'error']),
        loadingAggregations: false,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_FACETS_SUCCESS when initialAggregations is not empty', () => {
    const payload = {
      aggregations: { agg1: { foo: 'bar' } },
    };
    const state = reducer(
      fromJS({ publications: { initialAggregations: { initAgg: {} } } }),
      {
        type: AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
        payload,
      }
    );
    const expected = fromJS({
      publications: {
        aggregations: payload.aggregations,
        initialAggregations: { initAgg: {} },
        error: initialState.getIn(['publications', 'error']),
        loadingAggregations: false,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_PUBLICATIONS_FACETS_ERROR', () => {
    const state = reducer(Map(), {
      type: AUTHOR_PUBLICATIONS_FACETS_ERROR,
      payload: { message: 'error' },
    });
    const expected = fromJS({
      publications: {
        aggregations: initialState.getIn(['publications', 'aggregations']),
        error: { message: 'error' },
        loadingAggregations: false,
      },
    });
    expect(state).toEqual(expected);
  });
});
