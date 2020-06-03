import { fetchCitationSummary } from '../actions/citations';
import {
  isCitationSummaryEnabled,
  isCitationSummaryPreferenceSet,
} from '../literature/containers/CitationSummarySwitchContainer';

function shouldDispatchCitationSummary(state) {
  return (
    isCitationSummaryEnabled(state) || isCitationSummaryPreferenceSet(state)
  );
}

export function onLiteratureQueryChange(helper) {
  if (helper.isInitialQueryUpdate() || helper.hasQueryChanged()) {
    helper.fetchSearchResults();
    helper.updateLocation(helper.state.router.location.hash);
  }

  if (
    helper.isInitialQueryUpdate() ||
    helper.hasQueryChangedExceptSortAndPagination()
  ) {
    helper.fetchSearchAggregations();

    // `if shouldDispatchCitationSummary` can be pushed down to `fetchCitationSummary`
    if (shouldDispatchCitationSummary(helper.state)) {
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

    if (shouldDispatchCitationSummary(helper.state)) {
      helper.dispatch(fetchCitationSummary(helper.namespace));
    }
  }
}

export function onAuthorCitationsQueryChange(helper) {
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

export function onEventsQuerychange(helper) {
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

export function onExistingConferencesQueryChange(helper) {
  if (helper.hasQueryChanged()) {
    helper.fetchSearchResults();
  }
}
