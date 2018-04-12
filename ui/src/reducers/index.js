import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import searchReducer from './search';

const reducers = combineReducers({
  searchReducer,
  routerReducer,
});

export default reducers;
