import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
  CHANGE_SEARCH_SCOPE,
  SEARCH_AGGREGATIONS_REQUEST,
  SEARCH_AGGREGATIONS_SUCCESS,
  SEARCH_AGGREGATIONS_ERROR,
  NEW_SEARCH_REQUEST,
} from '../actions/actionTypes';
import { AUTHORS, JOBS } from '../common/routes';

const baseQuery = {
  sort: 'mostrecent',
  size: '25',
  page: '1',
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
  jobs: {
    name: 'jobs',
    pathname: 'jobs',
    query: baseQuery,
  },
});

export const initialState = fromJS({
  loading: false,
  total: 0,
  scope: searchScopes.get('literature'),
  error: null,
  sortOptions: null,
  aggregations: {},
  initialAggregations: {},
  loadingAggregations: false,
  aggregationsError: null,
});

function getSearchScopeForLocationChangeAction(action) {
  const { location } = action.payload;
  if (location.pathname.indexOf(AUTHORS) > -1) {
    return searchScopes.get('authors');
  }

  if (location.pathname.indexOf(JOBS) > -1) {
    return searchScopes.get('jobs');
  }

  return initialState.get('scope');
}

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATION_CHANGE:
      return state.set('scope', getSearchScopeForLocationChangeAction(action));
    case CHANGE_SEARCH_SCOPE:
      return state.set('scope', searchScopes.get(action.payload));
    case SEARCH_REQUEST:
      return state.set('loading', true);
    case SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('total', fromJS(action.payload.hits.total))
        .set('sortOptions', fromJS(action.payload.sort_options))
        .set('results', fromJS(action.payload.hits.hits))
        .set('error', initialState.get('error'));
    case SEARCH_ERROR:
      return state.set('loading', false).set('error', fromJS(action.payload));
    case SEARCH_AGGREGATIONS_REQUEST:
      return state.set('loadingAggregations', true);
    case NEW_SEARCH_REQUEST:
      return state.set(
        'initialAggregations',
        initialState.get('initialAggregations')
      );
    case SEARCH_AGGREGATIONS_SUCCESS:
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
