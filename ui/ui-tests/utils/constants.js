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
    authorDetail983328: `${appBaseUrl}/authors/983328`,
    jobsSearch: `${appBaseUrl}/jobs`,
    jobDetail1727456: `${appBaseUrl}/jobs/1727456`,
  },
};

const selectors = {
  searchResults: '[data-test-id="search-results"]',
};

module.exports = {
  routes,
  appBaseUrl,
  selectors,
};
