// @ts-expect-error ts-migrate(1208) FIXME: 'setupProxy.ts' cannot be compiled under '--isolat... Remove this comment to see the full error message
const proxy = require('http-proxy-middleware');

const localProxy = proxy({
  target: 'http://localhost:8000',
  secure: false,
  changeOrigin: true,
});

module.exports = (app: $TSFixMe) => {
  app.use('/api', localProxy);
};
