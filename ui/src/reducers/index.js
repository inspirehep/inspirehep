import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';

const reducers = combineReducers({
  literature,
  router: routerReducer,
  search,
});

export default reducers;
