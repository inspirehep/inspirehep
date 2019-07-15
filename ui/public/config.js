(() => {
  const CONFIG = {
    REACT_APP_PIWIK_URL: null,
    REACT_APP_PIWIK_SITE_ID: null,
    REACT_APP_SENTRY_DSN: null,
  };

  Object.defineProperty(window, 'CONFIG', { value: Object.freeze(CONFIG) });
})();
