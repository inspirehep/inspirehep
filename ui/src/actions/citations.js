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

function fetchingCitations() {
  return {
    type: CITATIONS_REQUEST,
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

function fetchingCitationsSummary() {
  return {
    type: CITATIONS_SUMMARY_REQUEST,
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

export function fetchCitations(pidType, recordId, paginationOptions) {
  return async (dispatch, getState, http) => {
    const { page, pageSize } = paginationOptions;
    dispatch(fetchingCitations());
    try {
      const citationsApiUrl = `/${pidType}/${recordId}/citations?page=${page}&size=${pageSize}`;
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
    dispatch(fetchingCitationsSummary());
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
