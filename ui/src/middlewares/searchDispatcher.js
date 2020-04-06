import omit from 'lodash.omit';
import {
  searchForCurrentQuery,
  fetchSearchAggregationsForCurrentQuery,
  newSearch,
} from '../actions/search';
import { shallowEqual } from '../common/utils';
import {
  SEARCH_BASE_QUERIES_UPDATE,
  SEARCH_QUERY_UPDATE,
} from '../actions/actionTypes';

function getQueryFromState(namespace, state) {
  return state.search.getIn(['namespaces', namespace, 'query']);
}

function getBaseQueryFromState(namespace, state) {
  return state.search.getIn(['namespaces', namespace, 'baseQuery']);
}

function getBaseAggregationsQueryFromState(namespace, state) {
  return state.search.getIn(['namespaces', namespace, 'baseAggregationsQuery']);
}

function hasQueryChangedExceptSortAndPagination(prevQuery, nextQuery) {
  return !shallowEqual(
    omit(prevQuery.toObject(), ['sort', 'page', 'size']),
    omit(nextQuery.toObject(), ['sort', 'page', 'size'])
  );
}

// TODO: this could be moved to the action creator
// only advantage is that it's easier to test SEARCH_QUERY_UPDATE in search container components
// rather than an async action
export default function({ getState, dispatch }) {
  return next => action => {
    if (action.type === SEARCH_QUERY_UPDATE) {
      const { namespace, query } = action.payload;

      const stateQuery = getQueryFromState(namespace, getState());
      const hasQueryQParamChanged =
        query.q != null && query.q !== stateQuery.get('q');
      if (hasQueryQParamChanged) {
        dispatch(newSearch(namespace));
      }

      // get prevQuery after newSearch because it might update the g
      const prevQuery = getQueryFromState(namespace, getState());
      const result = next(action);

      const nextState = getState();
      const nextQuery = getQueryFromState(namespace, nextState);
      const nextBaseQuery = getBaseQueryFromState(namespace, nextState);

      // to dispatch search when initial location change causes SEARCH_QUERY_UPDATE
      // (via `syncLocationWithSearch.js`) with empty query or a query same as the base query
      const isInitialQueryUpdate = shallowEqual(
        nextBaseQuery.toObject(),
        nextQuery.toObject()
      );
      const hasQueryChanged = prevQuery !== nextQuery;
      if (hasQueryChanged || isInitialQueryUpdate) {
        dispatch(searchForCurrentQuery(namespace));
      }

      if (
        hasQueryChangedExceptSortAndPagination(prevQuery, nextQuery) ||
        isInitialQueryUpdate
      ) {
        dispatch(fetchSearchAggregationsForCurrentQuery(namespace));
      }
      return result;
    }

    if (action.type === SEARCH_BASE_QUERIES_UPDATE) {
      const { namespace } = action.payload;
      const prevState = getState();
      const prevBaseQuery = getBaseQueryFromState(namespace, prevState);
      const prevBaseAggregationsQuery = getBaseAggregationsQueryFromState(
        namespace,
        prevState
      );

      const result = next(action);

      const nextState = getState();
      const nextBaseQuery = getBaseQueryFromState(namespace, nextState);
      const nextBaseAggregationsQuery = getBaseAggregationsQueryFromState(
        namespace,
        nextState
      );

      const hasBaseQueryChanged = prevBaseQuery !== nextBaseQuery;
      const hasBaseAggregationsQueryChanged =
        prevBaseAggregationsQuery !== nextBaseAggregationsQuery;

      if (hasBaseQueryChanged) {
        dispatch(searchForCurrentQuery(namespace));
      }

      if (hasBaseQueryChanged || hasBaseAggregationsQueryChanged) {
        dispatch(fetchSearchAggregationsForCurrentQuery(namespace));
      }

      return result;
    }

    return next(action);
  };
}
