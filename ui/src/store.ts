import { applyMiddleware, createStore as createReduxStore } from 'redux';
import thunk from 'redux-thunk';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'hist... Remove this comment to see the full error message
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'connected-react-router';
/* eslint-disable import/no-extraneous-dependencies */
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'redu... Remove this comment to see the full error message
import { createLogger } from 'redux-logger';
/* eslint-disable import/no-extraneous-dependencies */
import { composeWithDevTools } from 'redux-devtools-extension';

import createRootReducer from './reducers';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from './common/http.ts';
import queryParamsParserMiddleware from './middlewares/queryParamsParser';
import keepPreviousUrlMiddleware from './middlewares/keepPreviousUrl';
import {
  reHydrateRootStateFromStorage,
  createPersistToStorageMiddleware,
} from './middlewares/statePersister';
import clearStateDispatcher from './middlewares/clearStateDispatcher';
import redirectToErrorPageMiddleware from './middlewares/redirectToErrorPage';
import actionTrackerMiddleware from './middlewares/actionTracker';
import syncLocationWithSearch from './middlewares/syncLocationWithSearch';
import logoutUserOn401 from './middlewares/logoutUserOn401';

export const thunkMiddleware = thunk.withExtraArgument(http);

export const history = createHistory();
const connectedRouterMiddleware = routerMiddleware(history);

const reducersToPersist = ['ui', 'user'];

const PROD_MIDDLEWARES = [
  connectedRouterMiddleware,
  queryParamsParserMiddleware,
  keepPreviousUrlMiddleware,
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  createPersistToStorageMiddleware(reducersToPersist),
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

export default function createStore() {
  return createReduxStore(
    createRootReducer(history),
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    reHydrateRootStateFromStorage(reducersToPersist),
    composeWithDevTools(withMiddlewares())
  );
}
