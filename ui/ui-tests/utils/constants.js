const appBaseUrl = 'http://localhost:8080';

const routes = {
  localLogin: `${appBaseUrl}/user/login/local`,
  private: {
    holdingpenDashboard: `${appBaseUrl}/holdingpen/dashboard`,
    literatureSearch: `${appBaseUrl}/literature`,
    literatureDetail1472986: `${appBaseUrl}/literature/1472986`,
  },
  public: {
    home: appBaseUrl,
  },
};

module.exports = {
  routes,
  appBaseUrl,
};
