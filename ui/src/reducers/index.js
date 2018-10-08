import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';
import user from './user';
import submissions from './submissions';
import citations from './citations';
import authors from './authors';

const reducers = combineReducers({
  router: routerReducer,
  exceptions,
  inspect,
  literature,
  user,
  search,
  submissions,
  citations,
  authors,
});

export default reducers;
