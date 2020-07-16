import { fetchCitationSummary } from '../actions/citations';
import { isCitationSummaryEnabled } from '../literature/containers/CitationSummarySwitchContainer';

export function onLiteratureQueryChange(helper) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (
    helper.isInitialQueryUpdate() ||
    helper.hasQueryChangedExceptSortAndPagination()
  ) {
    helper.fetchSearchAggregations();

    // `if isCitationSummaryEnabled` can be pushed down to `fetchCitationSummary`
    if (isCitationSummaryEnabled(helper.state)) {
      helper.dispatch(fetchCitationSummary(helper.namespace));
    }
  }
}

export function onEmbeddedLiteratureQueryChange(helper) {
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

export function onEmbeddedSearchWithAggregationsQueryChange(helper) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    helper.fetchSearchAggregations();
  }
}

export function onAggregationlessCollectionQueryChange(helper) {
  if (helper.hasQueryChanged() || helper.isInitialQueryUpdate()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }
}

export function onJobsQueryChange(helper) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (helper.isAggregationsEmpty()) {
    helper.fetchSearchAggregations('');
  }
}

export function onCollectionQueryChange(helper) {
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

export function onEmbeddedSearchWithoutAggregationsQueryChange(helper) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }
}
