import { stringify } from 'qs';
import { push } from 'connected-react-router';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
  SEARCH_AGGREGATIONS_REQUEST,
  SEARCH_AGGREGATIONS_SUCCESS,
  SEARCH_AGGREGATIONS_ERROR,
  SEARCH_QUERY_UPDATE,
  NEW_SEARCH_REQUEST,
  CHANGE_SEARCH_BOX_NAMESPACE,
  SEARCH_BASE_QUERIES_UPDATE,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { FETCH_MODE_NEVER, FETCH_MODE_INITIAL } from '../reducers/search';

function getQueryForCurrentState(namespace, state) {
  const { search } = state;
  return search.getIn(['namespaces', namespace, 'query']).toJS();
}

function getPathnameForNamespace(namespace, state) {
  const { search } = state;
  return search.getIn(['namespaces', namespace, 'pathname']);
}

function searching(namespace) {
  return {
    type: SEARCH_REQUEST,
    payload: { namespace },
  };
}

function searchSuccess(namespace, data) {
  return {
    type: SEARCH_SUCCESS,
    payload: { namespace, data },
  };
}

function searchError(namespace, error) {
  return {
    type: SEARCH_ERROR,
    payload: { namespace, error },
    meta: { redirectableError: true },
  };
}

function shouldPushQueryToUrl(namespace, state) {
  const { search } = state;
  return !search.getIn(['namespaces', namespace, 'embedded']);
}

export function searchForCurrentQuery(namespace) {
  return async (dispatch, getState, http) => {
    dispatch(searching(namespace));
    const state = getState();
    const query = getQueryForCurrentState(namespace, state);
    const queryString = stringify(query, { indices: false });
    const pathname = getPathnameForNamespace(namespace, state);
    const url = `${pathname}?${queryString}`;

    if (shouldPushQueryToUrl(namespace, state)) {
      dispatch(push(url));
    }

    try {
      const response = await http.get(url, UI_SERIALIZER_REQUEST_OPTIONS);
      dispatch(searchSuccess(namespace, response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(searchError(namespace, errorPayload));
    }
  };
}

function fetchingSearchAggregations(namespace) {
  return {
    type: SEARCH_AGGREGATIONS_REQUEST,
    payload: { namespace },
  };
}

function searchAggregationsSuccess(namespace, data) {
  return {
    type: SEARCH_AGGREGATIONS_SUCCESS,
    payload: { data, namespace },
  };
}

function searchAggregationsError(namespace, error) {
  return {
    type: SEARCH_AGGREGATIONS_ERROR,
    payload: { error, namespace },
  };
}

export function fetchSearchAggregationsForCurrentQuery(namespace) {
  return async (dispatch, getState, http) => {
    const state = getState();
    const aggregationsFetchMode = state.search.getIn([
      'namespaces',
      namespace,
      'aggregationsFetchMode',
    ]);

    const isAggregationsEmpty = state.search
      .getIn(['namespaces', namespace, 'aggregations'])
      .isEmpty();

    if (
      aggregationsFetchMode === FETCH_MODE_NEVER ||
      (aggregationsFetchMode === FETCH_MODE_INITIAL && !isAggregationsEmpty)
    ) {
      return;
    }

    dispatch(fetchingSearchAggregations(namespace));

    const searchQuery =
      aggregationsFetchMode === FETCH_MODE_INITIAL
        ? {}
        : getQueryForCurrentState(namespace, state);
    const baseAggregationsQuery = state.search
      .getIn(['namespaces', namespace, 'baseAggregationsQuery'])
      .toJS();
    const aggregationsQuery = {
      ...searchQuery,
      ...baseAggregationsQuery,
    };
    const queryString = stringify(aggregationsQuery, { indices: false });
    const pathname = getPathnameForNamespace(namespace, state);
    const url = `${pathname}/facets?${queryString}`;

    try {
      const response = await http.get(url);
      dispatch(searchAggregationsSuccess(namespace, response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(searchAggregationsError(namespace, errorPayload));
    }
  };
}

// this then MAY trigger search and aggregations request in `searchDispatcher.js`
export function searchQueryUpdate(namespace, query) {
  return {
    type: SEARCH_QUERY_UPDATE,
    payload: { query, namespace },
  };
}

export function newSearch(namespace) {
  return {
    type: NEW_SEARCH_REQUEST,
    payload: { namespace },
  };
}

// this then MAY trigger search and aggregations request in `searchDispatcher.js`
export function searchBaseQueriesUpdate(
  namespace,
  { baseQuery, baseAggregationsQuery }
) {
  return {
    type: SEARCH_BASE_QUERIES_UPDATE,
    payload: { namespace, baseQuery, baseAggregationsQuery },
  };
}

export function changeSearchBoxNamespace(searchBoxNamespace) {
  return {
    type: CHANGE_SEARCH_BOX_NAMESPACE,
    payload: { searchBoxNamespace },
  };
}
