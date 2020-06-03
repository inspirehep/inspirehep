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
  SEARCH_QUERY_RESET,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import SearchHelper from '../search/helper';
import searchConfig from '../search/config';

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

function searchError(namespace, errorPayload) {
  return {
    type: SEARCH_ERROR,
    payload: { ...errorPayload, namespace },
    meta: { redirectableError: true },
  };
}

export function newSearch(namespace) {
  return {
    type: NEW_SEARCH_REQUEST,
    payload: { namespace },
  };
}

export function fetchSearchResults(namespace, url) {
  return async (dispatch, getState, http) => {
    dispatch(searching(namespace));
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

function searchAggregationsError(namespace, errorPayload) {
  return {
    type: SEARCH_AGGREGATIONS_ERROR,
    payload: { ...errorPayload, namespace },
  };
}

export function fetchSearchAggregations(namespace, url) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingSearchAggregations(namespace));
    try {
      const response = await http.get(url);
      dispatch(searchAggregationsSuccess(namespace, response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(searchAggregationsError(namespace, errorPayload));
    }
  };
}

export function searchQueryUpdate(
  namespace,
  query,
  dueToNavigationToSearchPage = false
) {
  return async (dispatch, getState) => {
    const currentQuery = getState().search.getIn([
      'namespaces',
      namespace,
      'query',
    ]);

    const hasQueryQParamChanged =
      query.q != null && query.q !== currentQuery.get('q');
    if (hasQueryQParamChanged) {
      // TODO: will embed into reducer
      dispatch(newSearch(namespace));
    }

    const prevState = getState();

    dispatch({
      type: SEARCH_QUERY_UPDATE,
      payload: { query, namespace },
    });

    const nextState = getState();

    const helper = new SearchHelper(
      namespace,
      prevState,
      nextState,
      dispatch,
      dueToNavigationToSearchPage
    );
    searchConfig[namespace].onQueryChange(
      helper,
      dispatch,
      dueToNavigationToSearchPage
    );
  };
}

export function searchQueryReset(namespace) {
  return {
    type: SEARCH_QUERY_RESET,
    payload: { namespace },
  };
}

export function searchBaseQueriesUpdate(
  namespace,
  { baseQuery, baseAggregationsQuery }
) {
  return async (dispatch, getState) => {
    const prevState = getState();

    dispatch({
      type: SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseQuery, baseAggregationsQuery },
    });

    const nextState = getState();
    const helper = new SearchHelper(namespace, prevState, nextState, dispatch);
    searchConfig[namespace].onQueryChange(helper, dispatch);
  };
}

export function changeSearchBoxNamespace(searchBoxNamespace) {
  return {
    type: CHANGE_SEARCH_BOX_NAMESPACE,
    payload: { searchBoxNamespace },
  };
}
