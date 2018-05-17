import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
} from '../actions/actionTypes';

const baseQuery = {
  sort: 'mostrecent',
  size: '25',
};

const searchScopes = fromJS({
  literature: {
    name: 'literature',
    pathname: 'literature',
    query: baseQuery,
  },
  holdingpen: {
    name: 'holdingpen',
    pathname: '/holdingpen/',
    query: baseQuery,
  },
});

export const initialState = fromJS({
  loading: false,
  aggregations: {},
  total: 0,
  scope: searchScopes.get('literature'),
});

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCATION_CHANGE:
      // TODO: handle every scope in a better way
      if (action.payload.pathname.includes('holdingpen')) {
        return state.set('scope', searchScopes.get('holdingpen'));
      }
      return state.set('scope', initialState.get('scope'));
    case SEARCH_REQUEST:
      return state.set('loading', true);
    case SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('aggregations', fromJS(action.payload.aggregations))
        .set('total', fromJS(action.payload.hits.total))
        .set('results', fromJS(action.payload.hits.hits));
    case SEARCH_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload));
    default:
      return state;
  }
};

export default searchReducer;
