import { fromJS } from 'immutable';
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
} from '../actions/actionTypes';
import { AUTHORS, JOBS, LITERATURE } from '../common/routes';

export const AUTHORS_NS = 'authors';
export const LITERATURE_NS = 'literature';
export const JOBS_NS = 'jobs';
export const AUTHOR_PUBLICATIONS_NS = 'authorPublications';
export const CONFERENCE_CONTRIBUTIONS_NS = 'conferenceContributions';

const initialBaseQuery = {
  sort: 'mostrecent',
  size: '25',
  page: '1',
};

const initialNamespaceState = {
  loading: false,
  total: 0,
  error: null,
  sortOptions: null,
  aggregations: {},
  initialAggregations: {},
  loadingAggregations: false,
  aggregationsError: null,
  baseQuery: initialBaseQuery,
  query: initialBaseQuery,
  baseAggregationsQuery: {},
};

export const FETCH_MODE_NEVER = 'never';
export const FETCH_MODE_ALWAYS = 'always';
export const FETCH_MODE_INITIAL = 'only-initial-without-query';

export const initialState = fromJS({
  searchBoxNamespace: LITERATURE_NS,
  namespaces: {
    [LITERATURE_NS]: {
      ...initialNamespaceState,
      pathname: LITERATURE,
      embedded: false,
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
    },
    [AUTHORS_NS]: {
      ...initialNamespaceState,
      pathname: AUTHORS,
      embedded: false,
      aggregationsFetchMode: FETCH_MODE_NEVER,
    },
    [JOBS_NS]: {
      ...initialNamespaceState,
      pathname: JOBS,
      embedded: false,
      aggregationsFetchMode: FETCH_MODE_INITIAL,
    },
    [AUTHOR_PUBLICATIONS_NS]: {
      ...initialNamespaceState,
      pathname: LITERATURE,
      embedded: true,
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
      baseQuery: {
        ...initialBaseQuery,
        size: '10',
      },
      query: {
        ...initialBaseQuery,
        size: '10',
      },
      baseAggregationsQuery: {
        facet_name: 'hep-author-publication',
      },
    },
    [CONFERENCE_CONTRIBUTIONS_NS]: {
      ...initialNamespaceState,
      pathname: LITERATURE,
      embedded: true,
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
      baseQuery: {
        ...initialBaseQuery,
        doc_type: 'conference paper',
        size: '10',
      },
      query: {
        ...initialBaseQuery,
        doc_type: 'conference paper',
        size: '10',
      },
      baseAggregationsQuery: {
        facet_name: 'hep-conference-contribution',
      },
    },
  },
});
// TODO: maybe move all static things into config so that we can easily add new collection
// from single, less complicated file.

const nonEmbeddedNamespaces = initialState
  .get('namespaces')
  .filterNot(namespaceState => namespaceState.get('embedded'));

export const SEARCHABLE_COLLECTION_PATHNAMES = nonEmbeddedNamespaces
  .map(namespaceState => namespaceState.get('pathname'))
  .valueSeq()
  .toArray();

export const SEARCH_BOX_NAMESPACES = nonEmbeddedNamespaces
  .map((_, namespace) => namespace)
  .valueSeq()
  .toArray();

function getNamespaceForLocationChangeAction(action) {
  const { location } = action.payload;
  if (location.pathname.indexOf(AUTHORS) > -1) {
    return AUTHORS_NS;
  }

  if (location.pathname.indexOf(JOBS) > -1) {
    return JOBS_NS;
  }

  return LITERATURE_NS;
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
      return state
        .setIn(
          ['namespaces', namespace, 'initialAggregations'],
          initialState.getIn(['namespaces', namespace, 'initialAggregations'])
        )
        .setIn(
          ['namespaces', namespace, 'query'],
          initialState.getIn(['namespaces', namespace, 'query'])
        );
    case SEARCH_BASE_QUERIES_UPDATE:
      return state
        .mergeIn(['namespaces', namespace, 'baseQuery'], baseQuery)
        .mergeIn(['namespaces', namespace, 'query'], baseQuery)
        .mergeIn(
          ['namespaces', namespace, 'baseAggregationsQuery'],
          baseAggregationsQuery
        );
    case SEARCH_QUERY_UPDATE:
      return state
        .mergeIn(
          ['namespaces', namespace, 'query'],
          state.getIn(['namespaces', namespace, 'baseQuery'])
        )
        .mergeIn(['namespaces', namespace, 'query'], query);
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
