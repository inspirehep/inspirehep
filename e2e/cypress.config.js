const { defineConfig } = require('cypress');

module.exports = defineConfig({
  "projectId": "439or1",
  "videosFolder": "cypress/__videos__",
  "screenshotsFolder": "cypress/__screenshots__",
  "env": {
    "inspirehep_url": "localhost:3000",
    "desktop_viewport_width": 1920,
    "desktop_viewport_height": 1080,
    "mobile_viewport_width": 375,
    "mobile_viewport_height": 667
  },
  "retries": {
    "runMode": 2,
    "openMode": 0
  },
  "video": false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    "specPattern": "cypress/e2e/**/*.{js,jsx,ts,tsx}"
  }
});
