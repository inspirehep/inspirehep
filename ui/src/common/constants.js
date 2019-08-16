export const PUBLISHED_QUERY = { citeable: true, refereed: true };
export const CITEABLE_QUERY = { citeable: true, refereed: undefined };
export const PUBLISHED_BAR_TYPE = 'published';
export const CITEABLE_BAR_TYPE = 'citeable';

export const POST_DOC_RANK_VALUE = 'POSTDOC';
export const RANK_VALUE_TO_DISPLAY = {
  SENIOR: 'Senior (permanent)',
  JUNIOR: 'Junior (leads to Senior)',
  STAFF: 'Staff (non-research)',
  VISITOR: 'Visitor',
  [POST_DOC_RANK_VALUE]: 'PostDoc',
  PHD: 'PhD',
  MASTER: 'Master',
  UNDERGRADUATE: 'Undergrad',
  OTHER: 'Other',
};

export const AUTHORS_PID_TYPE = 'authors';
export const LITERATURE_PID_TYPE = 'literature';
export const JOBS_PID_TYPE = 'jobs';
