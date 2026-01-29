(() => {
    const CONFIG = {
      EDITOR_AUTHORS_SCHEMA_URL: 'https://inspirebeta.net/schemas/records/authors.json',
      EDITOR_HEP_SCHEMA_URL: 'https://inspirebeta.net/schemas/records/hep.json',
      EDITOR_BACKOFFICE_API_URL: 'http://localhost:8001/api',
    };
    // Currently used only for local development
    Object.defineProperty(window, 'CONFIG', { value: Object.freeze(CONFIG) });
})();
  