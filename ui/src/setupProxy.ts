const proxy = require('http-proxy-middleware');

const localProxy = proxy({
  target: 'http://localhost:8000',
  secure: false,
  changeOrigin: true,
});

module.exports = (app: any) => {
  app.use('/api', localProxy);
};
