import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
/* eslint-disable import/no-extraneous-dependencies */
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
/* eslint-disable import/no-extraneous-dependencies */

import reducers from './reducers';
import http from './common/http';
import queryParamsParserMiddleware from './middlewares/queryParamsParser';
import persistUserStateMiddleware, {
  reHydrateRootStateWithUser,
} from './middlewares/persistUserState';
import searchDispatcherMiddleware from './middlewares/searchDispatcher';

export const thunkMiddleware = thunk.withExtraArgument(http);

export const history = createHistory();
const reduxRouterMiddleware = routerMiddleware(history);

const PROD_MIDDLEWARES = [
  reduxRouterMiddleware,
  queryParamsParserMiddleware,
  persistUserStateMiddleware,
  searchDispatcherMiddleware,
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
  reHydrateRootStateWithUser(),
  composeWithDevTools(withMiddlewares())
);
