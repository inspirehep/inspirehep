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
  ASSIGN_AUTHOR_NS,
  ASSIGN_CONFERENCE_NS,
  LITERATURE_REFERENCES_NS,
} from './constants';
import {
  onLiteratureQueryChange,
  onEmbeddedLiteratureQueryChange,
  onAggregationlessCollectionQueryChange,
  onCollectionQueryChange,
  onJobsQueryChange,
  onEmbeddedSearchWithAggregationsQueryChange,
  onEmbeddedSearchWithoutAggregationsQueryChange,
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
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
    redirectableError: true,
  },
  [JOBS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onJobsQueryChange,
    redirectableError: true,
  },
  [AUTHOR_PUBLICATIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [CONFERENCE_CONTRIBUTIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [INSTITUTIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
    redirectableError: true,
  },
  [INSTITUTION_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [CONFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [ASSIGN_CONFERENCE_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [EXISTING_CONFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [ASSIGN_AUTHOR_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [AUTHOR_CITATIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
    redirectableError: false,
  },
  [EXPERIMENTS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onCollectionQueryChange,
    redirectableError: true,
  },
  [EXPERIMENT_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedLiteratureQueryChange,
    redirectableError: false,
  },
  [AUTHOR_SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
    redirectableError: false,
  },
  [LITERATURE_SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
    redirectableError: false,
  },
  [LITERATURE_REFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: () => {},
    redirectableError: false,
  },
};

export default searchConfig;
