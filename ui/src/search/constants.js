import {
  LITERATURE,
  AUTHORS,
  JOBS,
  CONFERENCES,
  SEMINARS,
  INSTITUTIONS,
  EXPERIMENTS,
  JOURNALS,
  DATA,
  BACKOFFICE_SEARCH,
} from '../common/routes';

export const AUTHORS_NS = 'authors';
export const LITERATURE_NS = 'literature';
export const LITERATURE_REFERENCES_NS = 'literatureReferences';
export const JOBS_NS = 'jobs';
export const AUTHOR_PUBLICATIONS_NS = 'authorPublications';
export const AUTHOR_CITATIONS_NS = 'authorCitations';
export const AUTHOR_DATA_NS = 'authorData';
export const CONFERENCE_CONTRIBUTIONS_NS = 'conferenceContributions';
export const CONFERENCES_NS = 'conferences';
export const EXISTING_CONFERENCES_NS = 'existingConferences';
export const INSTITUTIONS_NS = 'institutions';
export const INSTITUTION_PAPERS_NS = 'institutionPapers';
export const SEMINARS_NS = 'seminars';
export const EXPERIMENTS_NS = 'experiments';
export const JOURNALS_NS = 'journals';
export const JOURNAL_PAPERS_NS = 'journalPapers';
export const EXPERIMENT_PAPERS_NS = 'experimentPapers';
export const AUTHOR_SEMINARS_NS = 'authorSeminars';
export const LITERATURE_SEMINARS_NS = 'literatureSeminars';
export const ASSIGN_AUTHOR_NS = 'assignAuthor';
export const ASSIGN_CONFERENCE_NS = 'assignConference';
export const CURATE_REFERENCE_NS = 'curateReference';
export const DATA_NS = 'data';

export const BACKOFFICE_SEARCH_NS = 'backofficeSearch';

export const SEARCH_BOX_NAMESPACES = [
  LITERATURE_NS,
  AUTHORS_NS,
  JOBS_NS,
  SEMINARS_NS,
  CONFERENCES_NS,
  INSTITUTIONS_NS,
  EXPERIMENTS_NS,
  JOURNALS_NS,
  DATA_NS,
];

export const SEARCHABLE_COLLECTION_PATHNAMES = [
  LITERATURE,
  AUTHORS,
  JOBS,
  SEMINARS,
  CONFERENCES,
  INSTITUTIONS,
  EXPERIMENTS,
  JOURNALS,
  DATA,
  BACKOFFICE_SEARCH,
];

export const NAMESPACE_TO_PATHNAME = {
  [LITERATURE_NS]: LITERATURE,
  [LITERATURE_REFERENCES_NS]: LITERATURE,

  [AUTHOR_PUBLICATIONS_NS]: LITERATURE,
  [AUTHOR_CITATIONS_NS]: LITERATURE,
  [AUTHOR_DATA_NS]: DATA,
  [CONFERENCE_CONTRIBUTIONS_NS]: LITERATURE,
  [INSTITUTION_PAPERS_NS]: LITERATURE,
  [EXISTING_CONFERENCES_NS]: CONFERENCES_NS,
  [EXPERIMENT_PAPERS_NS]: LITERATURE,
  [AUTHOR_SEMINARS_NS]: SEMINARS,
  [LITERATURE_SEMINARS_NS]: SEMINARS,
  [ASSIGN_AUTHOR_NS]: AUTHORS,
  [ASSIGN_CONFERENCE_NS]: CONFERENCES,
  [CURATE_REFERENCE_NS]: LITERATURE,
  [DATA_NS]: DATA,
  [AUTHORS_NS]: AUTHORS,
  [JOBS_NS]: JOBS,
  [SEMINARS_NS]: SEMINARS,
  [CONFERENCES_NS]: CONFERENCES,
  [INSTITUTIONS_NS]: INSTITUTIONS,
  [EXPERIMENTS_NS]: EXPERIMENTS,
  [JOURNALS_NS]: JOURNALS,
  [JOURNAL_PAPERS_NS]: LITERATURE,
  [BACKOFFICE_SEARCH_NS]: BACKOFFICE_SEARCH,
};

export const PATHNAME_TO_NAMESPACE = Object.entries(
  NAMESPACE_TO_PATHNAME
).reduce(
  (acc, [namespace, pathname]) => ({
    ...acc,
    [pathname]: namespace,
  }),
  {}
);
