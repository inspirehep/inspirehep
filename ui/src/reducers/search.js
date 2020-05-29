/* eslint-disable no-case-declarations */
import { fromJS, Map } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
  SEARCH_REQUEST,
  SEARCH_ERROR,
  SEARCH_SUCCESS,
  CHANGE_SEARCH_BOX_NAMESPACE,
  SEARCH_AGGREGATIONS_REQUEST,
  SEARCH_AGGREGATIONS_SUCCESS,
  SEARCH_AGGREGATIONS_ERROR,
  NEW_SEARCH_REQUEST,
  SEARCH_QUERY_UPDATE,
  SEARCH_BASE_QUERIES_UPDATE,
  SEARCH_QUERY_RESET,
} from '../actions/actionTypes';
import namespacesState from '../search/state';
import {
  LITERATURE_NS,
  SEARCHABLE_COLLECTION_PATHNAMES,
} from '../search/constants';
import searchConfig from '../search/config';
import { LITERATURE } from '../common/routes';

export const initialState = fromJS({
  searchBoxNamespace: LITERATURE_NS,
      embedded: false,
  namespaces: namespacesState,
});

function getNamespaceForLocationChangeAction(action) {
  const { location } = action.payload;
  const rootPathname =
    SEARCHABLE_COLLECTION_PATHNAMES.find(pathname =>
      location.pathname.startsWith(pathname)
    ) || LITERATURE;
  return rootPathname.substring(1); // root pathname to search namespace
}

// TODO: maybe implement selector functions that returns the path, ex: pathFor(namespace, 'loading')
const searchReducer = (state = initialState, action) => {
  const { payload } = action;
  const {
    namespace,
    searchBoxNamespace,
    data,
    error,
    query,
    baseQuery,
    baseAggregationsQuery,
  } =
    payload || {};
  switch (action.type) {
    case LOCATION_CHANGE: // TODO: move it to a middleware?
      return state.set(
        'searchBoxNamespace',
        getNamespaceForLocationChangeAction(action)
      );
    case CHANGE_SEARCH_BOX_NAMESPACE:
      return state.set('searchBoxNamespace', searchBoxNamespace);
    case NEW_SEARCH_REQUEST:
      const { persistedQueryParamsDuringNewSearch } = searchConfig[namespace];
      const persistedQuery = persistedQueryParamsDuringNewSearch.reduce(
        (persistedMap, param) =>
          persistedMap.set(
            param,
            state.getIn(['namespaces', namespace, 'query', param])
          ),
        Map()
      );
      return state
        .setIn(
          ['namespaces', namespace, 'initialAggregations'],
          initialState.getIn(['namespaces', namespace, 'initialAggregations'])
        )
        .setIn(
          ['namespaces', namespace, 'query'],
          initialState
            .getIn(['namespaces', namespace, 'query'])
            .merge(persistedQuery)
        );
    case SEARCH_BASE_QUERIES_UPDATE:
      return state
        .mergeIn(['namespaces', namespace, 'baseQuery'], baseQuery)
        .mergeIn(['namespaces', namespace, 'query'], baseQuery)
        .mergeIn(
          ['namespaces', namespace, 'baseAggregationsQuery'],
          baseAggregationsQuery
        );
    case SEARCH_QUERY_RESET:
      return state.setIn(
        ['namespaces', namespace, 'query'],
        initialState.getIn(['namespaces', namespace, 'query'])
      );
    case SEARCH_QUERY_UPDATE:
      const fullQuery = state
        .getIn(['namespaces', namespace, 'baseQuery'])
        .merge(state.getIn(['namespaces', namespace, 'query']))
        .merge(query);
      return state.setIn(['namespaces', namespace, 'query'], fullQuery);
    case SEARCH_REQUEST:
      return state.setIn(['namespaces', namespace, 'loading'], true);
    case SEARCH_SUCCESS:
      return state
        .setIn(['namespaces', namespace, 'loading'], false)
        .setIn(['namespaces', namespace, 'total'], fromJS(data.hits.total))
        .setIn(
          ['namespaces', namespace, 'sortOptions'],
          fromJS(data.sort_options)
        )
        .setIn(['namespaces', namespace, 'results'], fromJS(data.hits.hits))
        .setIn(
          ['namespaces', namespace, 'error'],
          initialState.getIn(['namespaces', namespace, 'error'])
        );
    case SEARCH_ERROR:
      return state
        .setIn(['namespaces', namespace, 'loading'], false)
        .setIn(['namespaces', namespace, 'error'], fromJS(error));
    case SEARCH_AGGREGATIONS_REQUEST:
      return state.setIn(
        ['namespaces', namespace, 'loadingAggregations'],
        true
      );
    case SEARCH_AGGREGATIONS_SUCCESS:
      if (
        state.getIn(['namespaces', namespace, 'initialAggregations']).isEmpty()
      ) {
        // eslint-disable-next-line no-param-reassign
        state = state.setIn(
          ['namespaces', namespace, 'initialAggregations'],
          fromJS(data.aggregations)
        );
      }
      return state
        .setIn(['namespaces', namespace, 'loadingAggregations'], false)
        .setIn(
          ['namespaces', namespace, 'aggregations'],
          fromJS(data.aggregations)
        )
        .setIn(
          ['namespaces', namespace, 'aggregationsError'],
          initialState.getIn(['namespaces', namespace, 'aggregationsError'])
        );
    case SEARCH_AGGREGATIONS_ERROR:
      return state
        .setIn(['namespaces', namespace, 'loadingAggregations'], false)
        .setIn(['namespaces', namespace, 'aggregationsError'], fromJS(error))
        .setIn(
          ['namespaces', namespace, 'aggregations'],
          initialState.getIn(['namespaces', namespace, 'aggregations'])
        );
    default:
      return state;
  }
};

export default searchReducer;
