/* eslint-disable import/no-dynamic-require, global-require */
const path = require('path');
const express = require('express');
const proxy = require('http-proxy-middleware');

const app = express();

// necessary for recording api responses when running tests locally (for the first time or ondemand)
const {
  UI_TESTS_HOST = 'localhost:8081',
  UI_TESTS_HTTP_SCHEME = 'http',
} = process.env;
app.use(
  '/api',
  proxy({
    target: `${UI_TESTS_HTTP_SCHEME}://${UI_TESTS_HOST}`,
    secure: false,
    onProxyReq: proxyReq => {
      proxyReq.removeHeader('Host');
      proxyReq.setHeader('Host', UI_TESTS_HOST);
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
