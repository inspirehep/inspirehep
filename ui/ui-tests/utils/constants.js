const appBaseUrl = 'http://localhost:8080';

const routes = {
  admin: {
    holdingpenDashboard: `${appBaseUrl}/holdingpen/dashboard`,
  },
  public: {
    home: appBaseUrl,
    literatureSearch: `${appBaseUrl}/literature`,
    literatureDetail1472986: `${appBaseUrl}/literature/1472986`,
  },
};

module.exports = {
  routes,
  appBaseUrl,
};
