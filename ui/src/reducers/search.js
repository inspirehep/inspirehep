import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import * as types from '../actions/actionTypes';

const baseQuery = {
  sort: 'mostrecent',
  size: 25,
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
  searching: false,
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
    case types.SEARCHING:
      return state.set('searching', true);
    case types.SEARCH_SUCCESS:
      return state
        .set('searching', false)
        .set('results', fromJS(action.payload));
    case types.SEARCH_ERROR:
      return state
        .set('searching', false)
        .set('error', fromJS(action.payload));
    default:
      return state;
  }
};

export default searchReducer;
