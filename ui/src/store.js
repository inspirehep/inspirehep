import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
/* eslint-disable import/no-extraneous-dependencies */
import { createLogger } from 'redux-logger';
/* eslint-disable import/no-extraneous-dependencies */
import { composeWithDevTools } from 'redux-devtools-extension';

import reducers from './reducers';
import http from './common/http';
import queryParamsParserMiddleware from './middlewares/queryParamsParser';
import keepPreviousUrlMiddleware from './middlewares/keepPreviousUrl';
import {
  reHydrateRootStateFromStorage,
  createPersistToStorageMiddleware,
} from './middlewares/statePersister';
import searchDispatcherMiddleware from './middlewares/searchDispatcher';
import redirectToErrorPageMiddleware from './middlewares/redirectToErrorPage';
import actionTrackerMiddleware from './middlewares/actionTracker';

export const thunkMiddleware = thunk.withExtraArgument(http);

export const history = createHistory();
const reduxRouterMiddleware = routerMiddleware(history);

const reducersToPersist = ['ui', 'user'];

const PROD_MIDDLEWARES = [
  reduxRouterMiddleware,
  queryParamsParserMiddleware,
  keepPreviousUrlMiddleware,
  createPersistToStorageMiddleware(reducersToPersist),
  searchDispatcherMiddleware,
  redirectToErrorPageMiddleware,
  actionTrackerMiddleware,
  thunkMiddleware,
];

const DEV_MIDDLEWARES = [...PROD_MIDDLEWARES, createLogger()];

const withMiddlewares = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(...PROD_MIDDLEWARES);
  }
  return applyMiddleware(...DEV_MIDDLEWARES);
};

export const store = createStore(
  reducers,
  reHydrateRootStateFromStorage(reducersToPersist),
  composeWithDevTools(withMiddlewares())
);
