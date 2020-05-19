import { stringify } from 'qs';
import omit from 'lodash.omit';

import { shallowEqual } from '../common/utils';
import { NAMESPACE_TO_PATHNAME } from './constants';

const SORT_AND_PAGINATION_PARAMS = ['sort', 'page', 'size'];

// FIXME: needs better name
export default class SearchHelper {
  constructor(namespace, prevState, state) {
    this.namespace = namespace;
    this.prevState = prevState;
    this.state = state;
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

  getSearchAggregationsUrl() {
    const pathname = NAMESPACE_TO_PATHNAME[this.namespace];
    const queryString = this.getAggregationsQueryString();
    return `${pathname}/facets?${queryString}`;
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
