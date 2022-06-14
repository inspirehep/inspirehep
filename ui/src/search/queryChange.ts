import { fetchCitationSummary } from '../actions/citations';
import { isCitationSummaryEnabled } from '../literature/containers/CitationSummarySwitchContainer';

export function onLiteratureQueryChange(helper: any) {
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

export function onEmbeddedLiteratureQueryChange(helper: any) {
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

export function onEmbeddedSearchWithAggregationsQueryChange(helper: any) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    helper.fetchSearchAggregations();
  }
}

export function onAggregationlessCollectionQueryChange(helper: any) {
  if (helper.hasQueryChanged() || helper.isInitialQueryUpdate()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }
}

export function onJobsQueryChange(helper: any) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation();
  }

  if (helper.isAggregationsEmpty()) {
    helper.fetchSearchAggregations('');
  }
}

export function onCollectionQueryChange(helper: any) {
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

export function onEmbeddedSearchWithoutAggregationsQueryChange(helper: any) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }
}
