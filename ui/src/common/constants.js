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
export const CONFERENCES_PID_TYPE = 'conferences';

export const INVENIO_URL = '//invenio-software.org';
export const HOLDINGPEN_URL = '/holdingpen';
export const AUTHORLIST_TOOL_URL = '/tools/authorlist';
export const INSPIRE_TWITTER_ACCOUNT = 'https://twitter.com/inspirehep';
export const SURVEY_LINK = 'https://forms.gle/CMgi3UsbpMuXxAfr6';
export const FEEDBACK_EMAIL = 'feedback@inspirehep.net';
export const BLOG_URL = 'https://blog.inspirehep.net';
export const HELP_BLOG_URL = 'https://labs.inspirehep.net/help';
export const KNOWLEDGE_BASE_URL = `${HELP_BLOG_URL}/knowledge-base`;
export const ABOUT_INSPIRE_URL = `${KNOWLEDGE_BASE_URL}/about-inspire`;
export const WHAT_IS_ORCID_URL = `${KNOWLEDGE_BASE_URL}/what-is-orcid`;
export const CONTENT_POLICY_URL = `${KNOWLEDGE_BASE_URL}/content-policy`;
export const PRIVACY_POLICY_URL = `${KNOWLEDGE_BASE_URL}/privacy-policy`;
export const TERMS_OF_USE_URL = `${KNOWLEDGE_BASE_URL}/terms-of-use`;
export const FAQ_URL = `${KNOWLEDGE_BASE_URL}/faq`;
export const PAPER_SEARCH_URL = `${KNOWLEDGE_BASE_URL}/inspire-paper-search`;

export const DATE_RANGE_FORMAT = 'YYYY-MM-DD';

export const RANGE_AGGREGATION_SELECTION_SEPARATOR = '--';

export const START_DATE_ALL = 'all';
export const START_DATE_UPCOMING = 'upcoming';

export const SEARCH_PAGE_GUTTER = { xs: 0, lg: 32 };
