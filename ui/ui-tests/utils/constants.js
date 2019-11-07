const appBaseUrl = 'http://localhost:8080';

const routes = {
  localLogin: `${appBaseUrl}/user/login/local`,
  private: {
    holdingpenDashboard: `${appBaseUrl}/holdingpen/dashboard`,
    authorSubmission: `${appBaseUrl}/submissions/authors`,
    author1073117UpdateSubmission: `${appBaseUrl}/submissions/authors/1073117`,
    literatureSubmission: `${appBaseUrl}/submissions/literature`,
    jobSubmission: `${appBaseUrl}/submissions/jobs`,
  },
  public: {
    home: appBaseUrl,
    literatureSearch: `${appBaseUrl}/literature`,
    literatureDetail1472986: `${appBaseUrl}/literature/1472986`,
    authorSearch: `${appBaseUrl}/authors`,
    authorDetail1274753: `${appBaseUrl}/authors/1274753`,
    jobsSearch: `${appBaseUrl}/jobs`,
    jobDetail1727456: `${appBaseUrl}/jobs/1727456`,
    conferenceSearch: `${appBaseUrl}/conferences`,
    conferenceDetail1203206: `${appBaseUrl}/conferences/1203206`,
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
