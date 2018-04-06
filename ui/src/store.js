import { applyMiddleware, createStore } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
/* eslint-disable import/no-extraneous-dependencies */
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
/* eslint-disable import/no-extraneous-dependencies */

import reducer from './reducer';

export const history = createHistory();
const reduxRouterMiddleware = routerMiddleware(history);

const getMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return applyMiddleware(reduxRouterMiddleware);
  } else {
    return applyMiddleware(reduxRouterMiddleware, createLogger());
  }
};

export const store = createStore(reducer, composeWithDevTools(getMiddleware()));
