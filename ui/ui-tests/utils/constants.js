const appBaseUrl = 'http://localhost:8080';

const routes = {
  admin: {
    holdingpenDashboard: `${appBaseUrl}/holdingpen/dashboard`,
  },
  public: {
    home: appBaseUrl,
    literatureSearch: `${appBaseUrl}/literature`,
  },
};

module.exports = {
  routes,
  appBaseUrl,
};
