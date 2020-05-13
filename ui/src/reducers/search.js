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
import {
  AUTHORS,
  JOBS,
  LITERATURE,
  CONFERENCES,
  INSTITUTIONS,
  SEMINARS,
} from '../common/routes';
import { START_DATE_UPCOMING, START_DATE_ALL } from '../common/constants';

export const AUTHORS_NS = 'authors';
export const LITERATURE_NS = 'literature';
export const JOBS_NS = 'jobs';
export const AUTHOR_PUBLICATIONS_NS = 'authorPublications';
export const CONFERENCE_CONTRIBUTIONS_NS = 'conferenceContributions';
export const CONFERENCES_NS = 'conferences';
export const EXISTING_CONFERENCES_NS = 'existingConferences';
export const INSTITUTIONS_NS = 'institutions';
export const INSTITUTION_PAPERS_NS = 'institutionPapers';
export const SEMINARS_NS = 'seminars';

const initialBaseQuery = {
  sort: 'mostrecent',
  size: '25',
  page: '1',
};

const initialPersistedQueryParamsDuringNewSearch = ['size'];

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
  persistedQueryParamsDuringNewSearch: initialPersistedQueryParamsDuringNewSearch,
  baseAggregationsQuery: {},
  // necessary to avoid using search query before it's ready
  hasQueryBeenUpdatedAtLeastOnce: false,
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
      order: 1,
    },
    [AUTHORS_NS]: {
      ...initialNamespaceState,
      pathname: AUTHORS,
      embedded: false,
      aggregationsFetchMode: FETCH_MODE_NEVER,
      order: 2,
    },
    [JOBS_NS]: {
      ...initialNamespaceState,
      pathname: JOBS,
      embedded: false,
      aggregationsFetchMode: FETCH_MODE_INITIAL,
      order: 3,
    },
    [AUTHOR_PUBLICATIONS_NS]: {
      ...initialNamespaceState,
      pathname: LITERATURE,
      embedded: true,
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
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
      },
      query: {
        ...initialBaseQuery,
        doc_type: 'conference paper',
      },
      baseAggregationsQuery: {
        facet_name: 'hep-conference-contribution',
      },
    },
    [CONFERENCES_NS]: {
      ...initialNamespaceState,
      pathname: CONFERENCES,
      embedded: false,
      baseQuery: {
        ...initialBaseQuery,
        start_date: START_DATE_UPCOMING,
        sort: 'dateasc',
      },
      query: {
        ...initialBaseQuery,
        start_date: START_DATE_UPCOMING,
        sort: 'dateasc',
      },
      persistedQueryParamsDuringNewSearch: [
        ...initialPersistedQueryParamsDuringNewSearch,
        'start_date',
      ],
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
      order: 5,
    },
    [EXISTING_CONFERENCES_NS]: {
      ...initialNamespaceState,
      pathname: CONFERENCES,
      embedded: true,
      baseQuery: {
        ...initialBaseQuery,
        start_date: START_DATE_ALL,
        sort: 'dateasc',
      },
      query: {
        ...initialBaseQuery,
        start_date: START_DATE_ALL,
        sort: 'dateasc',
      },
      persistedQueryParamsDuringNewSearch: [
        ...initialPersistedQueryParamsDuringNewSearch,
        'start_date',
      ],
      aggregationsFetchMode: FETCH_MODE_NEVER,
    },
    [INSTITUTIONS_NS]: {
      ...initialNamespaceState,
      pathname: INSTITUTIONS,
      embedded: false,
      aggregationsFetchMode: FETCH_MODE_NEVER,
      order: 6,
    },
    [INSTITUTION_PAPERS_NS]: {
      ...initialNamespaceState,
      pathname: LITERATURE,
      embedded: true,
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
      baseAggregationsQuery: {
        facet_name: 'hep-institution-papers',
      },
    },
    [SEMINARS_NS]: {
      ...initialNamespaceState,
      pathname: SEMINARS,
      embedded: false,
      baseQuery: {
        ...initialBaseQuery,
        start_date: START_DATE_UPCOMING,
        sort: 'dateasc',
      },
      query: {
        ...initialBaseQuery,
        start_date: START_DATE_UPCOMING,
        sort: 'dateasc',
      },
      persistedQueryParamsDuringNewSearch: [
        ...initialPersistedQueryParamsDuringNewSearch,
        'start_date',
      ],
      aggregationsFetchMode: FETCH_MODE_ALWAYS,
      order: 4,
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
  .sortBy(namespace => namespace.get('order'))
  .map((_, namespace) => namespace)
  .valueSeq()
  .toArray();

function getNamespaceForLocationChangeAction(action) {
  const { location } = action.payload;
  return (
    nonEmbeddedNamespaces.findKey(namespace =>
      location.pathname.startsWith(namespace.get('pathname'))
    ) || LITERATURE_NS
  );
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
      const persistedQueryParams = state.getIn([
        'namespaces',
        namespace,
        'persistedQueryParamsDuringNewSearch',
      ]);
      const persistedQuery = persistedQueryParams.reduce(
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
        )
        .setIn(
          ['namespaces', namespace, 'hasQueryBeenUpdatedAtLeastOnce'],
          true
        );
    case SEARCH_QUERY_RESET:
      return state
        .setIn(
          ['namespaces', namespace, 'query'],
          initialState.getIn(['namespaces', namespace, 'query'])
        )
        .setIn(
          ['namespaces', namespace, 'hasQueryBeenUpdatedAtLeastOnce'],
          initialState.getIn([
            'namespaces',
            namespace,
            'hasQueryBeenUpdatedAtLeastOnce',
          ])
        );
    case SEARCH_QUERY_UPDATE:
      const fullQuery = state
        .getIn(['namespaces', namespace, 'baseQuery'])
        .merge(state.getIn(['namespaces', namespace, 'query']))
        .merge(query);
      return state
        .setIn(['namespaces', namespace, 'query'], fullQuery)
        .setIn(
          ['namespaces', namespace, 'hasQueryBeenUpdatedAtLeastOnce'],
          true
        );
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
