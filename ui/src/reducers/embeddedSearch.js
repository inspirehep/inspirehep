import { fromJS } from 'immutable';

import {
  EMBEDDED_SEARCH_REQUEST,
  EMBEDDED_SEARCH_SUCCESS,
  EMBEDDED_SEARCH_ERROR,
  EMBEDDED_SEARCH_AGGREGATIONS_REQUEST,
  EMBEDDED_SEARCH_AGGREGATIONS_SUCCESS,
  EMBEDDED_SEARCH_AGGREGATIONS_ERROR,
  UPDATE_EMBEDDED_SEARCH_QUERY,
  CLEAR_STATE,
  EMBEDDED_SEARCH_SET_OPTIONS,
} from '../actions/actionTypes';

const baseQuery = {
  sort: 'mostrecent',
  size: '10',
  page: '1',
};

export const initialState = fromJS({
  loading: false,
  total: 0,
  baseAggregationsQuery: {},
  query: baseQuery,
  pidType: null,
  error: null,
  sortOptions: null,
  aggregations: {},
  initialAggregations: {},
  loadingAggregations: false,
  aggregationsError: null,
});

const embeddedSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case EMBEDDED_SEARCH_SET_OPTIONS:
      return state
        .set(
          'baseAggregationsQuery',
          fromJS(action.payload.baseAggregationsQuery)
        )
        .set('pidType', fromJS(action.payload.pidType));
    case UPDATE_EMBEDDED_SEARCH_QUERY:
      return state.mergeIn(['query'], fromJS(action.payload.query));
    case EMBEDDED_SEARCH_REQUEST:
      return state.set('loading', true);
    case EMBEDDED_SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('total', fromJS(action.payload.hits.total))
        .set('sortOptions', fromJS(action.payload.sort_options))
        .set('results', fromJS(action.payload.hits.hits))
        .set('error', initialState.get('error'));
    case EMBEDDED_SEARCH_ERROR:
      return state.set('loading', false).set('error', fromJS(action.payload));
    case EMBEDDED_SEARCH_AGGREGATIONS_REQUEST:
      return state.set('loadingAggregations', true);
    case EMBEDDED_SEARCH_AGGREGATIONS_SUCCESS:
      if (state.get('initialAggregations').isEmpty()) {
        // eslint-disable-next-line no-param-reassign
        state = state.set(
          'initialAggregations',
          fromJS(action.payload.aggregations)
        );
      }
      return state
        .set('loadingAggregations', false)
        .set('aggregations', fromJS(action.payload.aggregations))
        .set('aggregationsError', initialState.get('aggregationsError'));
    case EMBEDDED_SEARCH_AGGREGATIONS_ERROR:
      return state
        .set('loadingAggregations', false)
        .set('aggregationsError', fromJS(action.payload))
        .set('aggregations', initialState.get('aggregations'));
    default:
      return state;
  }
};

export default embeddedSearchReducer;
