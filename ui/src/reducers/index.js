import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';

const reducers = combineReducers({
  router: routerReducer,
  exceptions,
  inspect,
  literature,
  search,
});

export default reducers;
