import { fromJS } from 'immutable';

import {
  BACKOFFICE_LOGIN_ERROR,
  BACKOFFICE_LOGIN_SUCCESS,
  BACKOFFICE_LOGOUT_SUCCESS,
  BACKOFFICE_SEARCH_REQUEST,
  BACKOFFICE_SEARCH_ERROR,
  BACKOFFICE_SEARCH_SUCCESS,
  BACKOFFICE_SEARCH_QUERY_UPDATE,
  BACKOFFICE_AUTHOR_ERROR,
  BACKOFFICE_AUTHOR_REQUEST,
  BACKOFFICE_AUTHOR_SUCCESS,
  BACKOFFICE_SEARCH_QUERY_RESET,
  BACKOFFICE_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_RESOLVE_ACTION_SUCCESS,
  BACKOFFICE_RESOLVE_ACTION_ERROR,
  BACKOFFICE_LOGIN_CHECK,
  BACKOFFICE_LOGIN_REQUEST,
  BACKOFFICE_DELETE_SUCCESS,
  BACKOFFICE_DELETE_ERROR,
  BACKOFFICE_DELETE_REQUEST,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loggedIn: false,
  query: { page: 1, size: 10, ordering: '-_updated_at' },
  searchResults: [],
  totalResults: 0,
  loading: false,
  author: [],
  facets: [],
  actionInProgress: false,
});

const BackofficeReducer = (state = initialState, action) => {
  switch (action.type) {
    case BACKOFFICE_LOGIN_CHECK:
    case BACKOFFICE_LOGIN_REQUEST:
    case BACKOFFICE_LOGIN_ERROR:
    case BACKOFFICE_LOGOUT_SUCCESS:
      return initialState;
    case BACKOFFICE_LOGIN_SUCCESS:
      return state.set('loggedIn', true);
    case BACKOFFICE_SEARCH_REQUEST:
      return state.set('loading', true);
    case BACKOFFICE_SEARCH_ERROR:
      return state
        .set('loading', false)
        .set('searchResults', initialState.get('searchResults'))
        .set('totalResults', initialState.get('totalResults'))
        .set('facets', initialState.get('facets'));
    case BACKOFFICE_SEARCH_SUCCESS:
      return state
        .set('loading', false)
        .set('searchResults', fromJS(action.payload.data.results))
        .set('totalResults', action.payload.data.count)
        .set('facets', fromJS(action.payload.data.facets));
    case BACKOFFICE_AUTHOR_REQUEST:
      return state.set('loading', true);
    case BACKOFFICE_AUTHOR_ERROR:
      return state
        .set('loading', false)
        .set('author', initialState.get('author'));
    case BACKOFFICE_AUTHOR_SUCCESS:
      return state
        .set('loading', false)
        .set('author', fromJS(action.payload.data));
    case BACKOFFICE_SEARCH_QUERY_UPDATE:
      return state.set('query', fromJS(action.payload));
    case BACKOFFICE_SEARCH_QUERY_RESET:
      return state.set('query', fromJS({ page: 1, size: 10 }));
    case BACKOFFICE_RESOLVE_ACTION_REQUEST:
      return state.set('actionInProgress', fromJS(action.payload.type));
    case BACKOFFICE_RESOLVE_ACTION_SUCCESS:
      return state.set('actionInProgress', false);
    case BACKOFFICE_RESOLVE_ACTION_ERROR:
      return state.set('actionInProgress', false);
    case BACKOFFICE_DELETE_REQUEST:
      return state.set('loading', true);
    case BACKOFFICE_DELETE_SUCCESS:
      return state
        .set('author', initialState.get('author'))
        .set('loading', false);
    case BACKOFFICE_DELETE_ERROR:
      return state.set('loading', false);
    default:
      return state;
  }
};

export default BackofficeReducer;
