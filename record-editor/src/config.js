(() => {
    const CONFIG = {
      EDITOR_SCHEMA_URL: 'https://inspirebeta.net/schemas/records/authors.json',
      EDITOR_BACKOFFICE_API_URL: 'http://localhost:8001/api',
    };
    // Currently used only for local development
    Object.defineProperty(window, 'CONFIG', { value: Object.freeze(CONFIG) });
})();
  