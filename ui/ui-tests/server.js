/* eslint-disable import/no-dynamic-require, global-require */
const path = require('path');
const express = require('express');

const MOCKS_DIR = path.join(__dirname, './mocks');
const app = express();
const routeToFileMap = require('./routes.json');

app.use(express.static(path.join(__dirname, '../build')));

const apiRouter = express.Router();
apiRouter.get('*', (req, res) => {
  const relativeReponseFilePath = routeToFileMap[req.originalUrl] || req.path;
  res.json(require(`${MOCKS_DIR}/${relativeReponseFilePath}`));
});

app.use('/api', apiRouter);

app.listen(8080);
