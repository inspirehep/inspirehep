(() => {
  const CONFIG = {
    REACT_APP_PIWIK_URL: null,
    REACT_APP_PIWIK_SITE_ID: null,
    REACT_APP_SENTRY_DSN: null,
    REACT_APP_SENTRY_ENVIRONMENT: null,
    BANNERS: null,
    DISPLAY_GUIDE_ON_START: false,
    ASSIGN_OWN_PROFILE_UI_FEATURE_FLAG: true,
    ASSIGN_DIFFERENT_PROFILE_UI_FEATURE_FLAG: true,
    ASSIGN_NO_PROFILE_UI_FEATURE_FLAG: true,
    ASSIGN_NOT_LOGGED_IN_FEATURE_FLAG: true,
    SELF_CURATION_BUTTON: true,
    INSPIRE_WORKFLOWS_DAGS_URL: null,
    /* Example:
    BANNERS: [
      {
        id: 'release-04.2020',
        message:
          '<strong>Welcome to the new INSPIRE! <a href="https://old.inspirehep.net">The previous INSPIRE</a> will be phased out by June 2020.</strong>',
        action: {
          name: 'Learn more',
          href: 'https://forms.gle/ZQi31GvXXHcsgXgM6',
        },
      },
      {
        id: 'files outage-20.04.2020',
        type: 'warning',
        center: true,
        message:
          'We are facing some problems at the moment, our team is on it. Figures may not work properly',
        closable: false,
        pathnameRegexp: /^\/literature/
      },
    ],
    */
  };

  Object.defineProperty(window, 'CONFIG', { value: Object.freeze(CONFIG) });
})();
