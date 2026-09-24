import { fromJS } from 'immutable';

import {
  CITATIONS_SUMMARY_REQUEST,
  CITATIONS_SUMMARY_SUCCESS,
  CITATIONS_SUMMARY_ERROR,
  CITATIONS_BY_YEAR_REQUEST,
  CITATIONS_BY_YEAR_SUCCESS,
  CITATIONS_BY_YEAR_ERROR,
} from '../actions/actionTypes';

export const initialNamespaceState = fromJS({
  loadingCitationSummary: false,
  citationSummary: null,
  errorCitationSummary: null,
});

export const initialState = fromJS({
  namespaces: {},
  loadingCitationsByYear: false,
  byYear: {},
  errorCitationsByYear: null,
});

const citationsReducer = (state = initialState, action) => {
  const { namespace } = action.payload || {};
  switch (action.type) {
    case CITATIONS_SUMMARY_REQUEST:
      return state.updateIn(
        ['namespaces', namespace],
        initialNamespaceState,
        (namespaceState) => namespaceState.set('loadingCitationSummary', true)
      );
    case CITATIONS_SUMMARY_SUCCESS:
      return state.updateIn(
        ['namespaces', namespace],
        initialNamespaceState,
        (namespaceState) =>
          namespaceState
            .set('loadingCitationSummary', false)
            .set(
              'errorCitationSummary',
              initialNamespaceState.get('errorCitationSummary')
            )
            .set(
              'citationSummary',
              fromJS(action.payload.aggregations.citation_summary)
            )
      );
    case CITATIONS_SUMMARY_ERROR:
      return state.updateIn(
        ['namespaces', namespace],
        initialNamespaceState,
        (namespaceState) =>
          namespaceState
            .set('loadingCitationSummary', false)
            .set('errorCitationSummary', fromJS(action.payload.error))
            .set(
              'citationSummary',
              initialNamespaceState.get('citationSummary')
            )
      );
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
