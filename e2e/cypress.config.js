const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "439or1",
  videosFolder: "cypress/__videos__",
  screenshotsFolder: "cypress/__screenshots__",
  defaultCommandTimeout: 10000,
  env: {
    inspirehep_url: "http://localhost:8080",
    backoffice_url: "http://localhost:8001",
  },
  allowCypressEnv: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  video: false,
  e2e: {
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    experimentalRunAllSpecs: true,
  },
});
