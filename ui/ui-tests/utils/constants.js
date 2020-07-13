const appBaseUrl = 'http://localhost:8080';

const routes = {
  localLogin: `${appBaseUrl}/user/login/local`,
  private: {
    holdingpenDashboard: `${appBaseUrl}/holdingpen/dashboard`,
    authorSubmission: `${appBaseUrl}/submissions/authors`,
    author1073117UpdateSubmission: `${appBaseUrl}/submissions/authors/1073117`,
    literatureSubmission: `${appBaseUrl}/submissions/literature`,
    jobSubmission: `${appBaseUrl}/submissions/jobs`,
    conferenceSubmission: `${appBaseUrl}/submissions/conferences`,
    seminarSubmission: `${appBaseUrl}/submissions/seminars`,
  },
  public: {
    home: appBaseUrl,
    literatureSearch: `${appBaseUrl}/literature?ui-citation-summary=true`,
    literatureDetail1517533: `${appBaseUrl}/literature/1517533`,
    authorSearch: `${appBaseUrl}/authors`,
    authorDetail1274753: `${appBaseUrl}/authors/1274753?ui-citation-summary=true`,
    jobsSearch: `${appBaseUrl}/jobs`,
    jobDetail1727456: `${appBaseUrl}/jobs/1727456`,
    conferenceSearch: `${appBaseUrl}/conferences`,
    conferenceDetail1339293: `${appBaseUrl}/conferences/1339293`,
    institutionsSearch: `${appBaseUrl}/institutions`,
    institutionsDetail902624: `${appBaseUrl}/institutions/902624`,
  },
};

const selectors = {
  searchResults: '[data-test-id="search-results"]',
  loadingIndicator: '[data-test-id="loading"]',
  citationsByYearGraph: '[data-test-id="citations-by-year-graph"]',
};

module.exports = {
  routes,
  appBaseUrl,
  selectors,
};
