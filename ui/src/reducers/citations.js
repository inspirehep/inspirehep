import { fromJS } from 'immutable';

import {
  CITATIONS_SUMMARY_REQUEST,
  CITATIONS_SUMMARY_SUCCESS,
  CITATIONS_SUMMARY_ERROR,
  CITATIONS_BY_YEAR_REQUEST,
  CITATIONS_BY_YEAR_SUCCESS,
  CITATIONS_BY_YEAR_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loadingCitationSummary: false,
  citationSummary: null,
  errorCitationSummary: null,
  loadingCitationsByYear: false,
  byYear: {},
  errorCitationsByYear: null,
});

const citationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CITATIONS_SUMMARY_REQUEST:
      return state.set('loadingCitationSummary', true);
    case CITATIONS_SUMMARY_SUCCESS:
      return state
        .set('loadingCitationSummary', false)
        .set('errorCitationSummary', initialState.get('errorCitationSummary'))
        .set(
          'citationSummary',
          fromJS(action.payload.aggregations.citation_summary)
        );
    case CITATIONS_SUMMARY_ERROR:
      return state
        .set('loadingCitationSummary', false)
        .set('errorCitationSummary', fromJS(action.payload.error))
        .set('citationSummary', initialState.get('citationSummary'));
    case CITATIONS_BY_YEAR_REQUEST:
      return state.set('loadingCitationsByYear', true);
    case CITATIONS_BY_YEAR_SUCCESS:
      return state
        .set('loadingCitationsByYear', false)
        .set(
          'byYear',
          fromJS(action.payload.aggregations.citations_by_year.value)
        )
        .set('errorCitationsByYear', initialState.get('errorCitationsByYear'));
    case CITATIONS_BY_YEAR_ERROR:
      return state
        .set('loadingCitationsByYear', false)
        .set('byYear', initialState.get('byYear'))
        .set('errorCitationsByYear', fromJS(action.payload.error));
    default:
      return state;
  }
};

export default citationsReducer;
