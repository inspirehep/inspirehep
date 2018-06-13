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

export const thunkMiddleware = thunk.withExtraArgument(http);

export const history = createHistory();
const reduxRouterMiddleware = routerMiddleware(history);

const getMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(
      reduxRouterMiddleware,
      queryParamsParserMiddleware,
      persistUserStateMiddleware,
      thunkMiddleware
    );
  }
  return applyMiddleware(
    reduxRouterMiddleware,
    queryParamsParserMiddleware,
    persistUserStateMiddleware,
    thunkMiddleware,
    createLogger()
  );
};

export const store = createStore(
  reducers,
  reHydrateRootStateWithUser(),
  composeWithDevTools(getMiddleware())
);
