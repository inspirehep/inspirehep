import { fromJS } from 'immutable';

import {
  HOLDINGPEN_LOGIN_ERROR,
  HOLDINGPEN_LOGIN_SUCCESS,
  HOLDINGPEN_LOGOUT_SUCCESS,
  HOLDINGPEN_SEARCH_REQUEST,
  HOLDINGPEN_SEARCH_ERROR,
  HOLDINGPEN_SEARCH_SUCCESS,
  HOLDINGPEN_AUTHOR_REQUEST,
  HOLDINGPEN_AUTHOR_ERROR,
  HOLDINGPEN_AUTHOR_SUCCESS,
  HOLDINGPEN_SEARCH_QUERY_UPDATE,
  HOLDINGPEN_SEARCH_QUERY_RESET,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loggedIn: false,
  query: { page: 1, size: 10 },
  searchResults: [],
  totalResults: 0,
  loading: false,
  author: [],
});

const HOLDINGPENReducer = (state = initialState, action) => {
  switch (action.type) {
    case HOLDINGPEN_LOGIN_ERROR:
    case HOLDINGPEN_LOGOUT_SUCCESS:
      return initialState;
    case HOLDINGPEN_LOGIN_SUCCESS:
      return state.set('loggedIn', true);
    case HOLDINGPEN_SEARCH_REQUEST:
      return state.set('loading', true);
    case HOLDINGPEN_SEARCH_ERROR:
      return state
        .set('loading', false)
        .set('searchResults', initialState.get('searchResults'))
        .set('totalResults', initialState.get('totalResults'));
    case HOLDINGPEN_SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('searchResults', fromJS(action.payload.data.results))
        .set('totalResults', action.payload.data.count);
    case HOLDINGPEN_AUTHOR_REQUEST:
      return state.set('loading', true);
    case HOLDINGPEN_AUTHOR_ERROR:
      return state
        .set('loading', false)
        .set('author', initialState.get('author'));
    case HOLDINGPEN_AUTHOR_SUCCESS:
      return state
        .set('loading', false)
        .set('author', fromJS(action.payload.data));
    case HOLDINGPEN_SEARCH_QUERY_UPDATE:
      return state.set('query', fromJS(action.payload));
    case HOLDINGPEN_SEARCH_QUERY_RESET:
      return state.set('query', fromJS({ page: 1, size: 10 }));
    default:
      return state;
  }
};

export default HOLDINGPENReducer;
