const appBaseUrl = 'http://localhost:8080';

const routes = {
  localLogin: `${appBaseUrl}/user/login/local`,
  private: {
    holdingpenDashboard: `${appBaseUrl}/holdingpen/dashboard`,
    literatureSearch: `${appBaseUrl}/literature`,
    literatureDetail1472986: `${appBaseUrl}/literature/1472986`,
    authorSubmission: `${appBaseUrl}/submissions/authors`,
    author1073117UpdateSubmission: `${appBaseUrl}/submissions/authors/1073117`,
    literatureSubmission: `${appBaseUrl}/submissions/literature`,
    jobSubmission: `${appBaseUrl}/submissions/jobs`,
  },
  public: {
    home: appBaseUrl,
  },
};

module.exports = {
  routes,
  appBaseUrl,
};
