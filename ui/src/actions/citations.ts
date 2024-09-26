import { stringify } from 'qs';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';

import { HttpClientWrapper, isCancelError } from '../common/http';
import {
  CITATIONS_SUMMARY_REQUEST,
  CITATIONS_SUMMARY_SUCCESS,
  CITATIONS_SUMMARY_ERROR,
  CITATIONS_BY_YEAR_REQUEST,
  CITATIONS_BY_YEAR_SUCCESS,
  CITATIONS_BY_YEAR_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';
import { shouldExcludeSelfCitations } from '../literature/containers/ExcludeSelfCitationsContainer';

function fetchingCitationSummary(namespace: string) {
  return {
    type: CITATIONS_SUMMARY_REQUEST,
    payload: { namespace },
  };
}

function fetchCitationSummarySuccess<T, K>(result: {
  took: number;
  timed_out: boolean;
  hits: T;
  aggregations: K;
}) {
  return {
    type: CITATIONS_SUMMARY_SUCCESS,
    payload: result,
  };
}

function fetchCitationSummaryError(error: { error: Error }) {
  return {
    type: CITATIONS_SUMMARY_ERROR,
    payload: error,
  };
}

export function fetchCitationSummary(
  namespace: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingCitationSummary(namespace));
    try {
      const state = getState();
      const literatureSearchQuery = state.search
        .getIn(['namespaces', namespace, 'query'])
        .toJS();
      const excludeSelfCitations = shouldExcludeSelfCitations(state);
      const query = {
        ...literatureSearchQuery,
        facet_name: 'citation-summary',
        'exclude-self-citations': excludeSelfCitations || undefined,
      };

      const queryString = stringify(query, { indices: false });
      const url = `/literature/facets?${queryString}`;
      const response = await http.get(url, {}, 'citations-summary');
      dispatch(fetchCitationSummarySuccess(response.data));
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(fetchCitationSummaryError({ error }));
      }
    }
  };
}

function fetchingCitationsByYear() {
  return {
    type: CITATIONS_BY_YEAR_REQUEST,
  };
}

function fetchCitationsByYearSuccess<T, K>(result: {
  took: number;
  timed_out: boolean;
  hits: T;
  aggregations: K;
}) {
  return {
    type: CITATIONS_BY_YEAR_SUCCESS,
    payload: result,
  };
}

function fetchCitationsByYearError(error: { error: Error }) {
  return {
    type: CITATIONS_BY_YEAR_ERROR,
    payload: error,
  };
}

export function fetchCitationsByYear(literatureSearchQuery: {}): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingCitationsByYear());
    try {
      const query = {
        ...literatureSearchQuery,
        facet_name: 'citations-by-year',
      };
      const queryString = stringify(query, { indices: false });
      const url = `/literature/facets?${queryString}`;
      const response = await http.get(url, {}, 'citations-by-year');
      dispatch(fetchCitationsByYearSuccess(response.data));
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(fetchCitationsByYearError({ error }));
      }
    }
  };
}
