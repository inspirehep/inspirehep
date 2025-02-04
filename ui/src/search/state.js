import {
  ASSIGN_AUTHOR_NS,
  ASSIGN_CONFERENCE_NS,
  AUTHOR_CITATIONS_NS,
  AUTHOR_DATA_NS,
  AUTHOR_PUBLICATIONS_NS,
  AUTHOR_SEMINARS_NS,
  AUTHORS_NS,
  BACKOFFICE_SEARCH_NS,
  CONFERENCE_CONTRIBUTIONS_NS,
  CONFERENCES_NS,
  CURATE_REFERENCE_NS,
  DATA_NS,
  EXISTING_CONFERENCES_NS,
  EXPERIMENT_PAPERS_NS,
  EXPERIMENTS_NS,
  INSTITUTION_PAPERS_NS,
  INSTITUTIONS_NS,
  JOBS_NS,
  JOURNAL_PAPERS_NS,
  JOURNALS_NS,
  LITERATURE_NS,
  LITERATURE_REFERENCES_NS,
  LITERATURE_SEMINARS_NS,
  SEMINARS_NS,
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

const initialLiteratureReferencesBaseQuery = {
  size: '25',
  page: '1',
};

const initialBackofficeSearchBaseQuery = {
  size: '10',
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
    baseQuery: {
      ...initialBaseQuery,
      sort: 'bestmatch',
    },
    query: {
      ...initialBaseQuery,
      sort: 'bestmatch',
    },
  },
  [JOBS_NS]: {
    ...initialNamespaceState,
    baseQuery: {
      ...initialBaseQuery,
      status: 'open',
    },
  },
  [AUTHOR_PUBLICATIONS_NS]: {
    ...initialNamespaceState,
    baseQuery: {
      ...initialBaseQuery,
      search_type: 'hep-author-publication',
    },
    query: {
      ...initialBaseQuery,
      search_type: 'hep-author-publication',
    },
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
  [AUTHOR_DATA_NS]: {
    ...initialNamespaceState,
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
  [ASSIGN_CONFERENCE_NS]: {
    ...initialNamespaceState,
  },
  [CURATE_REFERENCE_NS]: {
    ...initialNamespaceState,
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
  [ASSIGN_AUTHOR_NS]: {
    ...initialNamespaceState,
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
  [DATA_NS]: {
    ...initialNamespaceState,
  },
  [EXPERIMENT_PAPERS_NS]: {
    ...initialNamespaceState,
    baseAggregationsQuery: {
      facet_name: 'hep-experiment-papers',
    },
  },
  [JOURNALS_NS]: {
    ...initialNamespaceState,
  },
  [JOURNAL_PAPERS_NS]: {
    ...initialNamespaceState,
    baseQuery: {
      ...initialBaseQuery,
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
  [LITERATURE_REFERENCES_NS]: {
    ...initialNamespaceState,
    baseQuery: initialLiteratureReferencesBaseQuery,
    query: initialLiteratureReferencesBaseQuery,
  },
  [BACKOFFICE_SEARCH_NS]: {
    ...initialNamespaceState,
    baseQuery: {
      ...initialBackofficeSearchBaseQuery,
    },
    query: {
      ...initialBackofficeSearchBaseQuery,
    },
  },
};

export default namespacesState;
