import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';
import user, { initialState as userInitialState } from './user';
import submissions from './submissions';
import citations from './citations';
import authors from './authors';
import ui, { initialState as uiInitialState } from './ui';

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
  ui,
});

export default reducers;

export const REDUCERS_TO_PERSISTS = [
  { name: 'ui', initialState: uiInitialState },
  { name: 'user', initialState: userInitialState },
];
