import { applyMiddleware, createStore as createReduxStore } from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { createReduxHistoryContext } from 'redux-first-history';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import createRootReducer from './reducers';
import http from './common/http';
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

const history = createBrowserHistory();
const { createReduxHistory, routerMiddleware, routerReducer } =
  createReduxHistoryContext({ history });

const reducersToPersist = ['ui', 'user'];

const PROD_MIDDLEWARES = [
  routerMiddleware,
  queryParamsParserMiddleware,
  keepPreviousUrlMiddleware,
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

let reduxHistory;
export const getReduxHistory = () => reduxHistory;

export default function createStore() {
  const store = createReduxStore(
    createRootReducer(routerReducer),
    reHydrateRootStateFromStorage(reducersToPersist),
    composeWithDevTools(withMiddlewares())
  );
  reduxHistory = createReduxHistory(store);
  return store;
}
