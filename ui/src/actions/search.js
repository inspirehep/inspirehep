import { push } from 'react-router-redux';
import { stringify } from 'qs';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
  CHANGE_SEARCH_SCOPE,
  SEARCH_AGGREGATIONS_REQUEST,
  SEARCH_AGGREGATIONS_SUCCESS,
  SEARCH_AGGREGATIONS_ERROR,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

export function changeSearchScope(scope) {
  return {
    type: CHANGE_SEARCH_SCOPE,
    payload: scope,
  };
}

function searching() {
  return {
    type: SEARCH_REQUEST,
  };
}

function searchSuccess(result) {
  return {
    type: SEARCH_SUCCESS,
    payload: result,
  };
}

function searchError(error) {
  return {
    type: SEARCH_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

export function searchForCurrentLocation() {
  return async (dispatch, getState, http) => {
    const { location } = getState().router;
    dispatch(searching());
    const url = `${location.pathname}${location.search}`;
    try {
      const response = await http.get(url, UI_SERIALIZER_REQUEST_OPTIONS);
      dispatch(searchSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(searchError(payload));
    }
  };
}

function fetchingSearchAggregations() {
  return {
    type: SEARCH_AGGREGATIONS_REQUEST,
  };
}

function searchAggregationsSuccess(result) {
  return {
    type: SEARCH_AGGREGATIONS_SUCCESS,
    payload: result,
  };
}

function searchAggregationsError(error) {
  return {
    type: SEARCH_AGGREGATIONS_ERROR,
    payload: error,
  };
}

export function fetchSearchAggregationsForCurrentLocation() {
  return async (dispatch, getState, http) => {
    const { location } = getState().router;
    dispatch(fetchingSearchAggregations());
    const url = `${location.pathname}/facets${location.search}`;
    try {
      const response = await http.get(url);
      dispatch(searchAggregationsSuccess(response.data));
    } catch (error) {
      dispatch(searchAggregationsError(error.response && error.response.data));
    }
  };
}

function getSearchUrl(state, query) {
  const pathname = state.search.getIn(['scope', 'pathname']);
  const queryString = stringify(query, { indices: false });
  return `/${pathname}?${queryString}`;
}

function appendQuery(state, query, excludeLocationQuery) {
  const baseQuery = state.search.getIn(['scope', 'query']).toJS();
  const locationQuery = excludeLocationQuery ? {} : state.router.location.query;

  if (query && locationQuery.page !== undefined) {
    locationQuery.page = 1;
  }

  return {
    ...baseQuery,
    ...locationQuery,
    ...query,
  };
}

export function pushQueryToLocation(query, clearLocationQuery = false) {
  return async (dispatch, getState) => {
    const state = getState();
    const newQuery = appendQuery(state, query, clearLocationQuery);
    const url = getSearchUrl(state, newQuery);
    if (Object.keys(newQuery).length > 0) {
      dispatch(push(url));
    }
  };
}
