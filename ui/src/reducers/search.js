import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
  CHANGE_SEARCH_SCOPE,
  SEARCH_AGGREGATIONS_REQUEST,
  SEARCH_AGGREGATIONS_SUCCESS,
  SEARCH_AGGREGATIONS_ERROR,
} from '../actions/actionTypes';

const baseQuery = {
  sort: 'mostrecent',
  size: '25',
};

export const searchScopes = fromJS({
  literature: {
    name: 'literature',
    pathname: 'literature',
    query: baseQuery,
  },
  authors: {
    name: 'authors',
    pathname: 'authors',
    query: baseQuery,
  },
});

export const initialState = fromJS({
  loading: false,
  total: 0,
  scope: searchScopes.get('literature'),
  error: null,
  aggregations: {},
  loadingAggregations: false,
  aggregationsError: null,
});

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATION_CHANGE:
      if (action.payload.pathname.indexOf('authors') > -1) {
        return state.set('scope', searchScopes.get('authors'));
      }
      return state.set('scope', initialState.get('scope'));
    case CHANGE_SEARCH_SCOPE:
      return state.set('scope', searchScopes.get(action.payload));
    case SEARCH_REQUEST:
      return state.set('loading', true);
    case SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('total', fromJS(action.payload.hits.total))
        .set('results', fromJS(action.payload.hits.hits))
        .set('error', initialState.get('error'));
    case SEARCH_ERROR:
      return state.set('loading', false).set('error', fromJS(action.payload));
    case SEARCH_AGGREGATIONS_REQUEST:
      return state.set('loadingAggregations', true);
    case SEARCH_AGGREGATIONS_SUCCESS:
      return state
        .set('loadingAggregations', false)
        .set('aggregations', fromJS(action.payload.aggregations))
        .set('aggregationsError', initialState.get('aggregationsError'));
    case SEARCH_AGGREGATIONS_ERROR:
      return state
        .set('loadingAggregations', false)
        .set('aggregationsError', fromJS(action.payload))
        .set('aggregations', initialState.get('aggregations'));
    default:
      return state;
  }
};

export default searchReducer;
