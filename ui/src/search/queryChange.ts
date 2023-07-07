/* eslint-disable no-unused-vars */
import { Action, ActionCreator, Dispatch } from 'redux';
import { fetchCitationSummary } from '../actions/citations';
import { isCitationSummaryEnabled } from '../literature/containers/CitationSummarySwitchContainer';

export function onLiteratureQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (
    helper.isInitialQueryUpdate() ||
    helper.hasQueryChangedExceptSortAndPagination()
  ) {
    // `if isCitationSummaryEnabled` can be pushed down to `fetchCitationSummary`
    if (isCitationSummaryEnabled(helper.state)) {
      helper.dispatch(fetchCitationSummary(helper.namespace));
    }
  }
  helper.fetchSearchAggregations();
}

export function onEmbeddedLiteratureQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    helper.fetchSearchAggregations();

    if (isCitationSummaryEnabled(helper.state)) {
      helper.dispatch(fetchCitationSummary(helper.namespace));
    }
  }
}

export function onEmbeddedSearchWithAggregationsQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    helper.fetchSearchAggregations();
  }
}

export function onAggregationlessCollectionQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.hasQueryChanged() || helper.isInitialQueryUpdate()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }
}

export function onJobsQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (helper.isAggregationsEmpty()) {
    helper.fetchSearchAggregations('');
  }
}

export function onCollectionQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (
    helper.isInitialQueryUpdate() ||
    helper.hasQueryChangedExceptSortAndPagination()
  ) {
    helper.fetchSearchAggregations();
  }
}

export function onEmbeddedSearchWithoutAggregationsQueryChange(
  helper: any,
  _dispatch: ActionCreator<Action>,
  _dueToNavigationToSearchPage?: boolean
) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }
}
