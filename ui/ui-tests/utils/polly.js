const { Polly } = require('@pollyjs/core');
const PuppeteerAdapter = require('@pollyjs/adapter-puppeteer');
const FSPersister = require('@pollyjs/persister-fs');

function createPollyInstance(recordingName) {
  const polly = new Polly(recordingName, {
    recordFailedRequests: true,
    matchRequestsBy: {
      order: false,
      headers: {
        exclude: ['x-devtools-emulate-network-conditions-client-id'],
      },
    },
    adapters: [PuppeteerAdapter],
    persister: FSPersister,
    adapterOptions: {
      puppeteer: { page },
    },
    persisterOptions: {
      fs: {
        recordingsDir: '__api_recordings__',
      },
    },
  });
  return polly;
}

module.exports = {
  createPollyInstance,
};
