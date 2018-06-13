import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';
import user from './user';

const reducers = combineReducers({
  router: routerReducer,
  exceptions,
  inspect,
  literature,
  user,
  search,
});

export default reducers;
