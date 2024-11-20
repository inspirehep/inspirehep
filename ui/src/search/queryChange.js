/* eslint-disable no-unused-vars */
import { fetchCitationSummary } from '../actions/citations';
import { isCitationSummaryEnabled } from '../literature/containers/CitationSummarySwitchContainer';

export function onLiteratureQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
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

export function onEmbeddedLiteratureQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
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

export function onEmbeddedSearchWithAggregationsQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    helper.fetchSearchAggregations();
  }
}

export function onAggregationlessCollectionQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
  if (helper.hasQueryChanged() || helper.isInitialQueryUpdate()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }
}

export function onJobsQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (helper.isAggregationsEmpty()) {
    helper.fetchSearchAggregations('');
  }
}

export function onCollectionQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
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

export function onEmbeddedSearchWithoutAggregationsQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }
}

export function onBackofficeQueryChange(helper, _dispatch, _dueToNavigationToSearchPage) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
    helper.fetchSearchAggregations()
  }
}
