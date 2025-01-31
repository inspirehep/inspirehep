import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';

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
  RESET_SEARCH_RESULTS,
} from './actionTypes';
import {
  UI_SERIALIZER_REQUEST_OPTIONS,
  isCancelError,
  HttpClientWrapper,
} from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import SearchHelper from '../search/helper';
import searchConfig from '../search/config';
import { getClientId } from '../tracker';

function searching(namespace: string) {
  return {
    type: SEARCH_REQUEST,
    payload: { namespace },
  };
}

function searchSuccess(namespace: string, data: {}) {
  return {
    type: SEARCH_SUCCESS,
    payload: { namespace, data },
  };
}

function searchError(namespace: string, errorPayload: { error: Error }) {
  let { redirectableError } =
    searchConfig[namespace as keyof typeof searchConfig];

  if (
    errorPayload.error.message === 'The syntax of the search query is invalid.'
  ) {
    redirectableError = false;
  }

  return {
    type: SEARCH_ERROR,
    payload: { ...errorPayload, namespace },
    meta: { redirectableError },
  };
}

export function newSearch(namespace: string) {
  return {
    type: NEW_SEARCH_REQUEST,
    payload: { namespace },
  };
}

// Temporary function to collect data for the AI service.
export function searchAI(
  query: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      const parserResponse = await http.get(`/search/query-parser?q=${query}`);
      // Only send free-form queries to the AI service for the moment
      /* eslint-disable no-underscore-dangle */
      if (parserResponse.data?.match?._all) {
        await http.post(`/ai/v1/query`, {
          query,
          user: getState().user.getIn(['data', 'email']),
          matomo_client_id: getClientId(),
        });
      }
    } catch (err) {
      console.error('Error while calling AI service: ', err);
    }
  };
}

export function fetchSearchResults(
  namespace: string,
  url: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(searching(namespace));
    try {
      const response = await http.get(
        url,
        UI_SERIALIZER_REQUEST_OPTIONS,
        `search-results-${namespace}`
      );
      dispatch(searchSuccess(namespace, response.data));
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const error = httpErrorToActionPayload(err);
        dispatch(searchError(namespace, error));
      }
    }
  };
}

function fetchingSearchAggregations(namespace: string) {
  return {
    type: SEARCH_AGGREGATIONS_REQUEST,
    payload: { namespace },
  };
}

function searchAggregationsSuccess(
  namespace: string,
  data: {
    took: number;
    timed_out: boolean;
    namespace: string;
  }
) {
  return {
    type: SEARCH_AGGREGATIONS_SUCCESS,
    payload: { data, namespace },
  };
}

function searchAggregationsError(namespace: string, error: Error) {
  return {
    type: SEARCH_AGGREGATIONS_ERROR,
    payload: { error, namespace },
  };
}

export function fetchSearchAggregations(
  namespace: string,
  url: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingSearchAggregations(namespace));
    try {
      const response = await http.get(
        url,
        {},
        `search-aggregations-${namespace}`
      );
      dispatch(searchAggregationsSuccess(namespace, response.data));
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(searchAggregationsError(namespace, error));
      }
    }
  };
}

export function searchQueryUpdate(
  namespace: string,
  query: {
    size?: number;
    q?: string;
    assigned?: number;
    page?: string;
    sort?: boolean;
  },
  dueToNavigationToSearchPage = false
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
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
    searchConfig[namespace as keyof typeof searchConfig].onQueryChange(
      helper,
      dispatch,
      dueToNavigationToSearchPage
    );
  };
}

export function searchQueryReset(namespace: string) {
  return {
    type: SEARCH_QUERY_RESET,
    payload: { namespace },
  };
}

export function searchResultsReset(namespace: string) {
  return {
    type: RESET_SEARCH_RESULTS,
    payload: { namespace },
  };
}

export function fetchAggregationsAndSearchQueryReset(
  namespace: string,
  shouldReset: boolean
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny
) => Promise<void> {
  return async (dispatch, getState) => {
    const prevState = getState();

    if (shouldReset) {
      dispatch({
        type: SEARCH_QUERY_RESET,
        payload: { namespace },
      });
    }

    const nextState = getState();
    const helper = new SearchHelper(namespace, prevState, nextState, dispatch);
    helper.fetchSearchAggregations();
  };
}

export function searchBaseQueriesUpdate(
  namespace: string,
  {
    baseQuery,
    baseAggregationsQuery,
  }: { baseQuery: { q: string }; baseAggregationsQuery?: { q: string } }
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState) => {
    const prevState = getState();

    dispatch({
      type: SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseQuery, baseAggregationsQuery },
    });

    const nextState = getState();
    const helper = new SearchHelper(namespace, prevState, nextState, dispatch);
    searchConfig[namespace as keyof typeof searchConfig].onQueryChange(
      helper,
      dispatch
    );
  };
}

export function changeSearchBoxNamespace(searchBoxNamespace: string) {
  return {
    type: CHANGE_SEARCH_BOX_NAMESPACE,
    payload: { searchBoxNamespace },
  };
}
