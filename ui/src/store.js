import { applyMiddleware, createStore as createReduxStore } from 'redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'connected-react-router';
/* eslint-disable import/no-extraneous-dependencies */
import { createLogger } from 'redux-logger';
/* eslint-disable import/no-extraneous-dependencies */
import { composeWithDevTools } from 'redux-devtools-extension';

import createRootReducer from './reducers';
import http from './common/http.ts';
import queryParamsParserMiddleware from './middlewares/queryParamsParser';
import keepPreviousUrlMiddleware from './middlewares/keepPreviousUrl';
import { createPersistToStorageMiddleware } from './middlewares/statePersister';
import clearStateDispatcher from './middlewares/clearStateDispatcher';
import redirectToErrorPageMiddleware from './middlewares/redirectToErrorPage';
import actionTrackerMiddleware from './middlewares/actionTracker';
import syncLocationWithSearch from './middlewares/syncLocationWithSearch';
import logoutUserOn401 from './middlewares/logoutUserOn401';

export const thunkMiddleware = thunk.withExtraArgument(http);

export const history = createHistory();
const connectedRouterMiddleware = routerMiddleware(history);

export const REDUCERS_TO_PERSIST = ['ui', 'user'];

const PROD_MIDDLEWARES = [
  connectedRouterMiddleware,
  queryParamsParserMiddleware,
  keepPreviousUrlMiddleware,
  createPersistToStorageMiddleware(REDUCERS_TO_PERSIST),
  clearStateDispatcher,
  redirectToErrorPageMiddleware,
  actionTrackerMiddleware,
  thunkMiddleware,
  syncLocationWithSearch,
  logoutUserOn401,
];

const DEV_MIDDLEWARES = [...PROD_MIDDLEWARES, createLogger()];

const withMiddlewares = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(...PROD_MIDDLEWARES);
  }
  return applyMiddleware(...DEV_MIDDLEWARES);
};

export default function createStore(rehydratedData) {
  return createReduxStore(
    createRootReducer(history),
    rehydratedData,
    composeWithDevTools(withMiddlewares())
  );
}
