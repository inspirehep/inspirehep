import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import search from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';
import user, { initialState as userInitialState } from './user';
import submissions from './submissions';
import citations from './citations';
import authors from './authors';
import jobs from './jobs';
import ui, { initialState as uiInitialState } from './ui';

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    exceptions,
    inspect,
    literature,
    user,
    search,
    submissions,
    citations,
    authors,
    ui,
    jobs,
  });
}

export const REDUCERS_TO_PERSISTS = [
  { name: 'ui', initialState: uiInitialState },
  { name: 'user', initialState: userInitialState },
];
