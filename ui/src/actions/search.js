import { push } from 'connected-react-router';
import { stringify } from 'qs';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
  CHANGE_SEARCH_SCOPE,
  SEARCH_AGGREGATIONS_REQUEST,
  SEARCH_AGGREGATIONS_SUCCESS,
  SEARCH_AGGREGATIONS_ERROR,
  NEW_SEARCH_REQUEST,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

export function changeSearchScope(scope) {
  return {
    type: CHANGE_SEARCH_SCOPE,
    payload: scope,
  };
}

function getSearchQueryStringForCurrentState(state) {
  const {
    router: { location },
    search,
  } = state;
  const baseQueryForCurrentSearchScope = search
    .getIn(['scope', 'query'])
    .toJS();
  return stringify(
    { ...baseQueryForCurrentSearchScope, ...location.query },
    { indices: false }
  );
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
    dispatch(searching());
    const state = getState();
    const searchQueryString = getSearchQueryStringForCurrentState(state);
    const {
      router: { location },
    } = state;
    const url = `${location.pathname}?${searchQueryString}`;
    try {
      const response = await http.get(url, UI_SERIALIZER_REQUEST_OPTIONS);
      dispatch(searchSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(searchError(payload));
    }
  };
}

function newSearch() {
  return {
    type: NEW_SEARCH_REQUEST,
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

export function fetchSearchAggregationsForCurrentLocation(
  useLocationQuery = true
) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingSearchAggregations());

    const state = getState();
    const searchQueryString = getSearchQueryStringForCurrentState(state);
    const {
      router: { location },
    } = state;
    const url = `${location.pathname}/facets${
      useLocationQuery ? `?${searchQueryString}` : ''
    }`;

    try {
      const response = await http.get(url);
      dispatch(searchAggregationsSuccess(response.data));
    } catch (error) {
      dispatch(searchAggregationsError(error.response && error.response.data));
    }
  };
}

// triggers LOCATION_CHANGE which then triggers search request via `middlewares/searchDispatcher`
export function pushQueryToLocation(query, clearLocationQuery = false) {
  // TODO: clearLocationQuery is set to true only if query has `q` so, remove the param
  // and use something `isNewSearch(query)` instead.
  return async (dispatch, getState) => {
    const state = getState();
    const locationQuery = clearLocationQuery ? {} : state.router.location.query;
    const newQuery = { ...locationQuery, ...query };

    const pathname = state.search.getIn(['scope', 'pathname']);
    const queryString = stringify(newQuery, { indices: false });
    const url = `/${pathname}?${queryString}`;

    if (Object.keys(newQuery).length > 0) {
      dispatch(push(url));
      if (clearLocationQuery) {
        // TODO: dispatch also when pathname (scope) changes
        dispatch(newSearch());
      }
    }
  };
}
