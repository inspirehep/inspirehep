import { stringify } from 'qs';
import omit from 'lodash.omit';
import { replace, push } from 'connected-react-router';

import { shallowEqual } from '../common/utils';
import { NAMESPACE_TO_PATHNAME } from './constants';
import { fetchSearchResults, fetchSearchAggregations } from '../actions/search';

const SORT_AND_PAGINATION_PARAMS = ['sort', 'page', 'size'];

// FIXME: needs better name
export default class SearchHelper {
  constructor(
    namespace,
    prevState,
    state,
    dispatch,
    dueToNavigationToSearchPage
  ) {
    this.namespace = namespace;
    this.prevState = prevState;
    this.state = state;
    this.dispatch = dispatch;
    this.dueToNavigationToSearchPage = dueToNavigationToSearchPage;
  }

  /**
   * Query update is called initially for a search route
   * and which doesn't necessarily changes the query
   *
   * For example:
   * When initial location is /literature?page=1 or /literature
   * This would update query "{ page: 1 }" or "{}" which wouldn't cause
   * query to be actually because initial query is { page: 1, size: 25...}
   * however we specifically want to know this condition to trigger fetch
   * for search for the initial query.
   */
  isInitialQueryUpdate() {
    return shallowEqual(
      this.getQuery().toObject(),
      this.getBaseQuery().toObject()
    );
  }

  updateLocation(urlSuffix = '') {
    const searchUrl = `${this.getPathname()}?${this.getQueryString()}${urlSuffix}`;
    if (this.isInitialQueryUpdate() || this.dueToNavigationToSearchPage) {
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
      this.dispatch(replace(searchUrl));
    } else {
      this.dispatch(push(searchUrl));
    }
  }

  fetchSearchResults() {
    const searchUrl = `${this.getPathname()}?${this.getQueryString()}`;
    this.dispatch(fetchSearchResults(this.namespace, searchUrl));
  }

  fetchSearchAggregations(queryString = this.getAggregationsQueryString()) {
    const searchAggsUrl = `${this.getPathname()}/facets?${queryString}`;
    this.dispatch(fetchSearchAggregations(this.namespace, searchAggsUrl));
  }

  hasQueryChanged() {
    return this.getQuery() !== this.getPrevQuery();
  }

  hasQueryChangedExceptSortAndPagination() {
    return !shallowEqual(
      omit(this.getPrevQuery().toObject(), SORT_AND_PAGINATION_PARAMS),
      omit(this.getQuery().toObject(), SORT_AND_PAGINATION_PARAMS)
    );
  }

  getPathname() {
    return NAMESPACE_TO_PATHNAME[this.namespace];
  }

  getQueryString() {
    const query = this.getQuery();
    return stringify(query.toJS(), { indices: false });
  }

  getPrevQuery() {
    return this.prevState.search.getIn(['namespaces', this.namespace, 'query']);
  }

  getQuery() {
    return this.state.search.getIn(['namespaces', this.namespace, 'query']);
  }

  getBaseQuery() {
    return this.state.search.getIn(['namespaces', this.namespace, 'baseQuery']);
  }

  getAggregationsQueryString() {
    const query = {
      ...this.getQuery().toJS(),
      ...this.getBaseAggregationsQuery().toJS(),
    };
    return stringify(query, { indices: false });
  }

  getBaseAggregationsQueryString() {
    const query = this.getBaseAggregationsQuery();
    return stringify(query.toJS(), { indices: false });
  }

  getBaseAggregationsQuery() {
    return this.state.search.getIn([
      'namespaces',
      this.namespace,
      'baseAggregationsQuery',
    ]);
  }

  isAggregationsEmpty() {
    return this.state.search
      .getIn(['namespaces', this.namespace, 'aggregations'])
      .isEmpty();
  }
}
