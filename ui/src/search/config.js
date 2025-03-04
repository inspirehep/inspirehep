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
  onLiteratureQueryChange,
  onEmbeddedLiteratureQueryChange,
  onAggregationlessCollectionQueryChange,
  onCollectionQueryChange,
  onJobsQueryChange,
  onEmbeddedSearchWithAggregationsQueryChange,
  onEmbeddedSearchWithoutAggregationsQueryChange,
  onBackofficeQueryChange,
} from './queryChange';

const defaultPersistedQueryParamsDuringNewSearch = ['size'];

const persistedQueryParamsDuringNewSearchForEvents = [
  ...defaultPersistedQueryParamsDuringNewSearch,
  'start_date',
];

const searchConfig = {
  [LITERATURE_NS]: {
    persistedQueryParamsDuringNewSearch: [
      ...defaultPersistedQueryParamsDuringNewSearch,
      'curation_collection',
    ],
    onQueryChange: onLiteratureQueryChange,
    redirectableError: true,
  },
  [AUTHORS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
    redirectableError: true,
  },
  [JOBS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onJobsQueryChange,
    redirectableError: true,
  },
  [AUTHOR_PUBLICATIONS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [CONFERENCE_CONTRIBUTIONS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [INSTITUTIONS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
    redirectableError: true,
  },
  [INSTITUTION_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [CONFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch:
      persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [ASSIGN_CONFERENCE_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [EXISTING_CONFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch:
      persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [ASSIGN_AUTHOR_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch:
      persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [AUTHOR_CITATIONS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
    redirectableError: false,
  },
  [AUTHOR_DATA_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
    redirectableError: false,
  },
  [JOURNALS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
    redirectableError: true,
  },
  [JOURNAL_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [EXPERIMENTS_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [EXPERIMENT_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch:
      persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [DATA_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [AUTHOR_SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch:
      persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
    redirectableError: false,
  },
  [LITERATURE_SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch:
      persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [LITERATURE_REFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: () => {},
    redirectableError: false,
  },
  [CURATE_REFERENCE_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [BACKOFFICE_SEARCH_NS]: {
    persistedQueryParamsDuringNewSearch:
      defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onBackofficeQueryChange,
    redirectableError: true,
  },
};

export default searchConfig;
