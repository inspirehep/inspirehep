import { stringify } from 'qs';

import {
  EMBEDDED_SEARCH_REQUEST,
  EMBEDDED_SEARCH_SUCCESS,
  EMBEDDED_SEARCH_ERROR,
  EMBEDDED_SEARCH_AGGREGATIONS_REQUEST,
  EMBEDDED_SEARCH_AGGREGATIONS_SUCCESS,
  EMBEDDED_SEARCH_AGGREGATIONS_ERROR,
  UPDATE_EMBEDDED_SEARCH_QUERY,
  EMBEDDED_SEARCH_SET_OPTIONS,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

function searching() {
  return {
    type: EMBEDDED_SEARCH_REQUEST,
  };
}

function searchSuccess(result) {
  return {
    type: EMBEDDED_SEARCH_SUCCESS,
    payload: result,
  };
}

function searchError(error) {
  return {
    type: EMBEDDED_SEARCH_ERROR,
    payload: error,
  };
}

function fetchingSearchAggregations() {
  return {
    type: EMBEDDED_SEARCH_AGGREGATIONS_REQUEST,
  };
}

function searchAggregationsSuccess(result) {
  return {
    type: EMBEDDED_SEARCH_AGGREGATIONS_SUCCESS,
    payload: result,
  };
}

function searchAggregationsError(error) {
  return {
    type: EMBEDDED_SEARCH_AGGREGATIONS_ERROR,
    payload: error,
  };
}

function getSearchQueryFromState(state) {
  const { embeddedSearch } = state;
  const query = embeddedSearch.get('query').toJS();
  return query;
}

function getAggregationsQueryFromState(state) {
  const { embeddedSearch } = state;
  const baseAggregationsQuery = embeddedSearch
    .get('baseAggregationsQuery')
    .toJS();
  return {
    ...baseAggregationsQuery,
    ...getSearchQueryFromState(state),
  };
}

async function fetchSearchResults(dispatch, state, http) {
  const pidType = state.embeddedSearch.get('pidType');
  const query = getSearchQueryFromState(state);
  const queryString = stringify(query, { indices: false });

  const url = `/${pidType}?${queryString}`;
  dispatch(searching());
  try {
    const response = await http.get(url, UI_SERIALIZER_REQUEST_OPTIONS);
    dispatch(searchSuccess(response.data));
  } catch (error) {
    const payload = httpErrorToActionPayload(error);
    dispatch(searchError(payload));
  }
}

async function fetchSearchAggregations(dispatch, state, http) {
  const pidType = state.embeddedSearch.get('pidType');
  const query = getAggregationsQueryFromState(state);

  const queryString = stringify(query, { indices: false });
  const url = `/${pidType}/facets?${queryString}`;

  dispatch(fetchingSearchAggregations());
  try {
    const response = await http.get(url);
    dispatch(searchAggregationsSuccess(response.data));
  } catch (error) {
    const payload = httpErrorToActionPayload(error);
    dispatch(searchAggregationsError(payload));
  }
}

function updateSearchQuery(query) {
  return {
    type: UPDATE_EMBEDDED_SEARCH_QUERY,
    payload: { query },
  };
}

export function search(newQuery) {
  return async (dispatch, getState, http) => {
    await dispatch(updateSearchQuery(newQuery));
    // TODO: conditional calls like in `searchDispatcher`
    const state = getState();
    fetchSearchAggregations(dispatch, state, http);
    fetchSearchResults(dispatch, state, http);
  };
}

export function setOptions(options) {
  return {
    type: EMBEDDED_SEARCH_SET_OPTIONS,
    payload: options,
  };
}
