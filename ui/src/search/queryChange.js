import { push, replace } from 'connected-react-router';

import { fetchSearchResults, fetchSearchAggregations } from '../actions/search';
import { fetchCitationSummary } from '../actions/citations';
import { isCitationSummaryEnabled } from '../literature/containers/CitationSummarySwitchContainer';

export function onLiteratureQueryChange(helper, dispatch) {
  const isInitialQueryUpdate = helper.isInitialQueryUpdate();
  if (isInitialQueryUpdate || helper.hasQueryChanged()) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    const urlWithHash = `${searchUrl}${helper.state.router.location.hash}`;
    // FIXME: this logic exist on others too
    if (isInitialQueryUpdate) {
      /**
       * Call `replace` which basically sets some extra base query params
       * that weren't part of the initial location query
       * example: `/literature?page=1` would be changed to `/literature?page=1&size=25...`
       *
       * `replace` is used instead of `push` no to create a endless loop
       * and allow "go-back" on the location history.
       * Otherwise each time we go back we would get  `/literature?page=1` which then
       * would cause `/literature?page=1&size=25...` to be pushed to the history and so on.
       */
      dispatch(replace(urlWithHash));
    } else {
      dispatch(push(urlWithHash));
    }

    dispatch(fetchSearchResults(helper.namespace, searchUrl));
  }

  if (isInitialQueryUpdate || helper.hasQueryChangedExceptSortAndPagination()) {
    const aggsQueryString = helper.getAggregationsQueryString();
    const searchAggsUrl = `${helper.getPathname()}/facets?${aggsQueryString}`;
    dispatch(fetchSearchAggregations(helper.namespace, searchAggsUrl));

    if (isCitationSummaryEnabled(helper.state)) {
      dispatch(fetchCitationSummary(helper.namespace));
    }
  }
}

export function onEmbeddedLiteratureQueryChange(helper, dispatch) {
  if (helper.hasQueryChanged()) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    dispatch(fetchSearchResults(helper.namespace, searchUrl));
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    const aggsQueryString = helper.getAggregationsQueryString();
    const searchAggsUrl = `${helper.getPathname()}/facets?${aggsQueryString}`;
    dispatch(fetchSearchAggregations(helper.namespace, searchAggsUrl));

    if (isCitationSummaryEnabled(helper.state)) {
      dispatch(fetchCitationSummary(helper.namespace));
    }
  }
}

export function onAuthorCitationsQueryChange(helper, dispatch) {
  if (helper.hasQueryChanged()) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    dispatch(fetchSearchResults(helper.namespace, searchUrl));
  }

  if (helper.hasQueryChangedExceptSortAndPagination()) {
    const aggsQueryString = helper.getAggregationsQueryString();
    const searchAggsUrl = `${helper.getPathname()}/facets?${aggsQueryString}`;
    dispatch(fetchSearchAggregations(helper.namespace, searchAggsUrl));
  }
}

export function onAggregationlessCollectionQueryChange(helper, dispatch) {
  const isInitialQueryUpdate = helper.isInitialQueryUpdate();
  const hasQueryChanged = helper.hasQueryChanged();
  if (hasQueryChanged || isInitialQueryUpdate) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    dispatch(fetchSearchResults(helper.namespace, searchUrl));

    if (isInitialQueryUpdate) {
      dispatch(replace(searchUrl));
    } else if (hasQueryChanged) {
      dispatch(push(searchUrl));
    }
  }
}

export function onJobsQueryChange(helper, dispatch) {
  const isInitialQueryUpdate = helper.isInitialQueryUpdate();
  const hasQueryChanged = helper.hasQueryChanged();
  if (hasQueryChanged || isInitialQueryUpdate) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    dispatch(fetchSearchResults(helper.namespace, searchUrl));

    if (isInitialQueryUpdate) {
      dispatch(replace(searchUrl));
    } else if (hasQueryChanged) {
      dispatch(push(searchUrl));
    }
  }

  if (helper.isAggregationsEmpty()) {
    const searchAggsUrl = `${helper.getPathname()}/facets`;
    dispatch(fetchSearchAggregations(helper.namespace, searchAggsUrl));
  }
}

export function onEventsQuerychange(helper, dispatch) {
  const isInitialQueryUpdate = helper.isInitialQueryUpdate();
  if (isInitialQueryUpdate || helper.hasQueryChanged()) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    if (isInitialQueryUpdate) {
      dispatch(replace(searchUrl));
    } else {
      dispatch(push(searchUrl));
    }

    dispatch(fetchSearchResults(helper.namespace, searchUrl));
  }

  if (isInitialQueryUpdate || helper.hasQueryChangedExceptSortAndPagination()) {
    const aggsQueryString = helper.getAggregationsQueryString();
    const searchAggsUrl = `${helper.getPathname()}/facets?${aggsQueryString}`;
    dispatch(fetchSearchAggregations(helper.namespace, searchAggsUrl));
  }
}

export function onExistingConferencesQueryChange(helper, dispatch) {
  const hasQueryChanged = helper.hasQueryChanged();
  if (hasQueryChanged) {
    const searchUrl = `${helper.getPathname()}?${helper.getQueryString()}`;
    dispatch(fetchSearchResults(helper.namespace, searchUrl));
  }
}
