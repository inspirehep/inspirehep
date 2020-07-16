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
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onLiteratureQueryChange,
  },
  [AUTHORS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
  },
  [JOBS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onJobsQueryChange,
  },
  [AUTHOR_PUBLICATIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
  },
  [CONFERENCE_CONTRIBUTIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
  },
  [INSTITUTIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onAggregationlessCollectionQueryChange,
  },
  [INSTITUTION_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedLiteratureQueryChange,
  },
  [CONFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onCollectionQueryChange,
  },
  [EXISTING_CONFERENCES_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
  },
  [SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onCollectionQueryChange,
  },
  [AUTHOR_CITATIONS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
  },
  [EXPERIMENTS_NS]: {
    persistedQueryParamsDuringNewSearch: defaultPersistedQueryParamsDuringNewSearch,
    onQueryChange: onCollectionQueryChange,
  },
  [EXPERIMENT_PAPERS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedLiteratureQueryChange,
  },
  [AUTHOR_SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithAggregationsQueryChange,
  },
  [LITERATURE_SEMINARS_NS]: {
    persistedQueryParamsDuringNewSearch: persistedQueryParamsDuringNewSearchForEvents,
    onQueryChange: onEmbeddedSearchWithoutAggregationsQueryChange,
  },
};

export default searchConfig;
