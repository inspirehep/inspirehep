import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';

const reducers = combineReducers({
  search,
  router: routerReducer,
});

export default reducers;
