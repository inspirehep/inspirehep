import { stringify } from 'qs';
import {
  CITATIONS_SUMMARY_REQUEST,
  CITATIONS_SUMMARY_SUCCESS,
  CITATIONS_SUMMARY_ERROR,
  CITATIONS_BY_YEAR_REQUEST,
  CITATIONS_BY_YEAR_SUCCESS,
  CITATIONS_BY_YEAR_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';
import { isCancelError } from '../common/http.ts';
import { shouldExcludeSelfCitations } from '../literature/containers/ExcludeSelfCitationsContainer';

function fetchingCitationSummary(namespace) {
  return {
    type: CITATIONS_SUMMARY_REQUEST,
    payload: { namespace },
  };
}

function fetchCitationSummarySuccess(result) {
  return {
    type: CITATIONS_SUMMARY_SUCCESS,
    payload: result,
  };
}

function fetchCitationSummaryError(error) {
  return {
    type: CITATIONS_SUMMARY_ERROR,
    payload: error,
  };
}

export function fetchCitationSummary(namespace) {
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
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchCitationSummaryError(payload));
      }
    }
  };
}

function fetchingCitationsByYear() {
  return {
    type: CITATIONS_BY_YEAR_REQUEST,
  };
}

function fetchCitationsByYearSuccess(result) {
  return {
    type: CITATIONS_BY_YEAR_SUCCESS,
    payload: result,
  };
}

function fetchCitationsByYearError(error) {
  return {
    type: CITATIONS_BY_YEAR_ERROR,
    payload: error,
  };
}

export function fetchCitationsByYear(literatureSearchQuery) {
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
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchCitationsByYearError(payload));
      }
    }
  };
}
