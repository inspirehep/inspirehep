import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
/* eslint-disable import/no-extraneous-dependencies */
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
/* eslint-disable import/no-extraneous-dependencies */

import reducers from './reducers';
import http from './common/http';

export const thunkMiddleware = thunk.withExtraArgument(http);
export const history = createHistory();
const reduxRouterMiddleware = routerMiddleware(history);

const getMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(reduxRouterMiddleware, thunkMiddleware);
  } else {
    return applyMiddleware(reduxRouterMiddleware, createLogger(), thunkMiddleware);
  }
};

export const store = createStore(reducers, composeWithDevTools(getMiddleware()));
