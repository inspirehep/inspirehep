import { stringify } from 'qs';
import {
  CITATIONS_ERROR,
  CITATIONS_SUCCESS,
  CITATIONS_REQUEST,
  CITATIONS_SUMMARY_REQUEST,
  CITATIONS_SUMMARY_SUCCESS,
  CITATIONS_SUMMARY_ERROR,
  CITATIONS_BY_YEAR_REQUEST,
  CITATIONS_BY_YEAR_SUCCESS,
  CITATIONS_BY_YEAR_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetchingCitations(query) {
  return {
    type: CITATIONS_REQUEST,
    payload: query,
  };
}

function fetchCitationsSuccess(result) {
  return {
    type: CITATIONS_SUCCESS,
    payload: result,
  };
}

function fetchCitationsError(error) {
  return {
    type: CITATIONS_ERROR,
    payload: error,
  };
}

function fetchingCitationsSummary(query) {
  return {
    type: CITATIONS_SUMMARY_REQUEST,
    payload: { query },
  };
}

function fetchCitationsSummarySuccess(result) {
  return {
    type: CITATIONS_SUMMARY_SUCCESS,
    payload: result,
  };
}

function fetchCitationsSummaryError(error) {
  return {
    type: CITATIONS_SUMMARY_ERROR,
    payload: error,
  };
}

export function fetchCitations(recordId, newQuery = {}) {
  return async (dispatch, getState, http) => {
    const { citations } = getState();
    const query = {
      ...citations.get('query').toJS(),
      ...newQuery,
    };
    dispatch(fetchingCitations(query));
    const queryString = stringify(query, { indices: false });
    try {
      const citationsApiUrl = `/literature/${recordId}/citations?${queryString}`;
      const response = await http.get(citationsApiUrl);
      dispatch(fetchCitationsSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchCitationsError(payload));
    }
  };
}

export function fetchCitationSummary(literatureSearchQuery) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingCitationsSummary(literatureSearchQuery));
    try {
      const query = {
        ...literatureSearchQuery,
        facet_name: 'citation-summary',
      };
      const queryString = stringify(query, { indices: false });
      const url = `/literature/facets?${queryString}`;
      const response = await http.get(url);
      dispatch(fetchCitationsSummarySuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchCitationsSummaryError(payload));
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
      const response = await http.get(url);
      dispatch(fetchCitationsByYearSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchCitationsByYearError(payload));
    }
  };
}
