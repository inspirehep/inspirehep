const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: '439or1',
  videosFolder: 'cypress/__videos__',
  screenshotsFolder: 'cypress/__screenshots__',
  env: {
    inspirehep_url: 'localhost:3000',
    mobile_viewport_width: 375,
    mobile_viewport_height: 667,
  },
  retries: {
    runMode: 0,
    openMode: 0,
  },
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0
  },
})
