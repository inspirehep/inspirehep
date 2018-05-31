import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';

const reducers = combineReducers({
  router: routerReducer,
  literature,
  exceptions,
  search,
});

export default reducers;
