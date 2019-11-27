import { applyMiddleware, createStore as createReduxStore } from 'redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'connected-react-router';
/* eslint-disable import/no-extraneous-dependencies */
import { createLogger } from 'redux-logger';
/* eslint-disable import/no-extraneous-dependencies */
import { composeWithDevTools } from 'redux-devtools-extension';

import createRootReducer from './reducers';
import http from './common/http';
import queryParamsParserMiddleware from './middlewares/queryParamsParser';
import keepPreviousUrlMiddleware from './middlewares/keepPreviousUrl';
import {
  reHydrateRootStateFromStorage,
  createPersistToStorageMiddleware,
} from './middlewares/statePersister';
import searchDispatcherMiddleware from './middlewares/searchDispatcher';
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
  createPersistToStorageMiddleware(reducersToPersist),
  searchDispatcherMiddleware,
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
    reHydrateRootStateFromStorage(reducersToPersist),
    composeWithDevTools(withMiddlewares())
  );
}
