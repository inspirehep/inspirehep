/* eslint-disable import/no-dynamic-require, global-require */
const path = require('path');
const express = require('express');
const proxy = require('http-proxy-middleware');

const app = express();

// proxy api calls to inspire-next running locally (localhost:5000)
// necessary for recording api responses when running tests locally (for the first time or ondemand)
app.use(
  '/api',
  proxy({
    target: 'http://host.docker.internal:5000',
    onProxyReq: proxyReq => {
      proxyReq.removeHeader('Host');
      proxyReq.setHeader('Host', 'localhost:5000');
    },
  })
);

// serve static files of production build
app.use(express.static(path.join(__dirname, '../build')));
// necessary for client side routing to work
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build/index.html'));
});

app.listen(8080);
