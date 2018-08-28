import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';
import user from './user';
import submissions from './submissions';
import citations from './citations';

const reducers = combineReducers({
  router: routerReducer,
  exceptions,
  inspect,
  literature,
  user,
  search,
  submissions,
  citations,
});

export default reducers;
