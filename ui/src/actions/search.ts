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
import {
  UI_SERIALIZER_REQUEST_OPTIONS,
  isCancelError,
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
} from '../common/http.ts';
import { httpErrorToActionPayload } from '../common/utils';
import SearchHelper from '../search/helper';
import searchConfig from '../search/config';

function searching(namespace: any) {
  return {
    type: SEARCH_REQUEST,
    payload: { namespace },
  };
}

function searchSuccess(namespace: any, data: any) {
  return {
    type: SEARCH_SUCCESS,
    payload: { namespace, data },
  };
}

function searchError(namespace: any, errorPayload: any) {
  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const { redirectableError } = searchConfig[namespace];
  return {
    type: SEARCH_ERROR,
    payload: { ...errorPayload, namespace },
    meta: { redirectableError },
  };
}

export function newSearch(namespace: any) {
  return {
    type: NEW_SEARCH_REQUEST,
    payload: { namespace },
  };
}

export function fetchSearchResults(namespace: any, url: any) {
  return async (dispatch: any, getState: any, http: any) => {
    dispatch(searching(namespace));
    try {
      const response = await http.get(
        url,
        UI_SERIALIZER_REQUEST_OPTIONS,
        `search-results-${namespace}`
      );
      dispatch(searchSuccess(namespace, response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const errorPayload = httpErrorToActionPayload(error);
        dispatch(searchError(namespace, errorPayload));
      }
    }
  };
}

function fetchingSearchAggregations(namespace: any) {
  return {
    type: SEARCH_AGGREGATIONS_REQUEST,
    payload: { namespace },
  };
}

function searchAggregationsSuccess(namespace: any, data: any) {
  return {
    type: SEARCH_AGGREGATIONS_SUCCESS,
    payload: { data, namespace },
  };
}

function searchAggregationsError(namespace: any, errorPayload: any) {
  return {
    type: SEARCH_AGGREGATIONS_ERROR,
    payload: { ...errorPayload, namespace },
  };
}

export function fetchSearchAggregations(namespace: any, url: any) {
  return async (dispatch: any, getState: any, http: any) => {
    dispatch(fetchingSearchAggregations(namespace));
    try {
      const response = await http.get(
        url,
        {},
        `search-aggregations-${namespace}`
      );
      dispatch(searchAggregationsSuccess(namespace, response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const errorPayload = httpErrorToActionPayload(error);
        dispatch(searchAggregationsError(namespace, errorPayload));
      }
    }
  };
}

export function searchQueryUpdate(
  namespace: any,
  query: any,
  dueToNavigationToSearchPage = false
) {
  return async (dispatch: any, getState: any) => {
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
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    searchConfig[namespace].onQueryChange(
      helper,
      dispatch,
      dueToNavigationToSearchPage
    );
  };
}

export function searchQueryReset(namespace: any) {
  return {
    type: SEARCH_QUERY_RESET,
    payload: { namespace },
  };
}

export function searchBaseQueriesUpdate(
  namespace: any,
  {
    baseQuery,
    baseAggregationsQuery
  }: any
) {
  return async (dispatch: any, getState: any) => {
    const prevState = getState();

    dispatch({
      type: SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseQuery, baseAggregationsQuery },
    });

    const nextState = getState();
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 5 arguments, but got 4.
    const helper = new SearchHelper(namespace, prevState, nextState, dispatch);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    searchConfig[namespace].onQueryChange(helper, dispatch);
  };
}

export function changeSearchBoxNamespace(searchBoxNamespace: any) {
  return {
    type: CHANGE_SEARCH_BOX_NAMESPACE,
    payload: { searchBoxNamespace },
  };
}
