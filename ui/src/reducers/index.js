import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import search, { initialState as searchInitialState } from './search';
import literature from './literature';
import exceptions from './exceptions';
import inspect from './inspect';
import user, { initialState as userInitialState } from './user';
import submissions from './submissions';
import citations from './citations';
import authors from './authors';
import jobs from './jobs';
import conferences from './conferences';
import institutions from './institutions';
import seminars from './seminars';
import experiments from './experiments';
import bibliographyGenerator from './bibliographyGenerator';
import ui, { initialState as uiInitialState } from './ui';
import { LITERATURE_NS, LITERATURE_REFERENCES_NS } from '../search/constants';

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
    conferences,
    institutions,
    seminars,
    experiments,
    bibliographyGenerator,
  });
}

export const REDUCERS_TO_PERSISTS = [
  { name: 'ui', initialState: uiInitialState },
  { name: 'user', initialState: userInitialState },
  {
    name: 'search',
    initialState: searchInitialState,
    statePath: ['namespaces', LITERATURE_REFERENCES_NS, 'query', 'size'],
  },
  {
    name: 'search',
    initialState: searchInitialState,
    statePath: ['namespaces', LITERATURE_NS, 'query', 'size'],
  },
];
