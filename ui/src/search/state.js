import {
  LITERATURE_NS,
  AUTHORS_NS,
  CONFERENCES_NS,
  EXISTING_CONFERENCES_NS,
  SEMINARS_NS,
  JOBS_NS,
  AUTHOR_PUBLICATIONS_NS,
  CONFERENCE_CONTRIBUTIONS_NS,
  INSTITUTIONS_NS,
  INSTITUTION_PAPERS_NS,
  AUTHOR_CITATIONS_NS,
  EXPERIMENTS_NS,
  EXPERIMENT_PAPERS_NS,
  AUTHOR_SEMINARS_NS,
  LITERATURE_SEMINARS_NS,
} from './constants';
import {
  START_DATE_UPCOMING,
  START_DATE_ALL,
  DATE_DESC,
} from '../common/constants';

const initialBaseQuery = {
  sort: 'mostrecent',
  size: '25',
  page: '1',
};

const initialNamespaceState = {
  loading: false,
  initialTotal: null,
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

const namespacesState = {
  [LITERATURE_NS]: {
    ...initialNamespaceState,
  },
  [AUTHORS_NS]: {
    ...initialNamespaceState,
  },
  [JOBS_NS]: {
    ...initialNamespaceState,
  },
  [AUTHOR_PUBLICATIONS_NS]: {
    ...initialNamespaceState,
    baseAggregationsQuery: {
      facet_name: 'hep-author-publication',
    },
  },
  [AUTHOR_CITATIONS_NS]: {
    ...initialNamespaceState,
    baseAggregationsQuery: {
      facet_name: 'hep-author-citations',
    },
  },
  [CONFERENCE_CONTRIBUTIONS_NS]: {
    ...initialNamespaceState,
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
  },
  [EXISTING_CONFERENCES_NS]: {
    ...initialNamespaceState,
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
  },
  [INSTITUTIONS_NS]: {
    ...initialNamespaceState,
  },
  [INSTITUTION_PAPERS_NS]: {
    ...initialNamespaceState,
    baseAggregationsQuery: {
      facet_name: 'hep-institution-papers',
    },
  },
  [SEMINARS_NS]: {
    ...initialNamespaceState,
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
  },
  [EXPERIMENTS_NS]: {
    ...initialNamespaceState,
  },
  [EXPERIMENT_PAPERS_NS]: {
    ...initialNamespaceState,
    baseAggregationsQuery: {
      facet_name: 'hep-experiment-papers',
    },
  },
  [AUTHOR_SEMINARS_NS]: {
    ...initialNamespaceState,
    baseQuery: {
      ...initialBaseQuery,
      start_date: START_DATE_ALL,
      sort: DATE_DESC,
    },
    query: {
      ...initialBaseQuery,
      start_date: START_DATE_ALL,
      sort: DATE_DESC,
    },
  },
  [LITERATURE_SEMINARS_NS]: {
    ...initialNamespaceState,
    baseQuery: {
      ...initialBaseQuery,
      start_date: START_DATE_ALL,
      sort: DATE_DESC,
    },
    query: {
      ...initialBaseQuery,
      start_date: START_DATE_ALL,
      sort: DATE_DESC,
    },
  },
};

export default namespacesState;
