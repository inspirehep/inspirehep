import configureMockStore from 'redux-mock-store';

import { initialState as citations } from '../reducers/citations';
import { initialState as search } from '../reducers/search';
import { initialState as literature } from '../reducers/literature';
import { initialState as user } from '../reducers/user';
import { initialState as submissions } from '../reducers/submissions';
import { initialState as inspect } from '../reducers/inspect';
import { initialState as exceptions } from '../reducers/exceptions';
import { initialState as authors } from '../reducers/authors';
import { initialState as ui } from '../reducers/ui';

import { thunkMiddleware } from '../store';

export function getState() {
  return {
    citations,
    literature,
    router: {
      location: {
        query: {},
        previousUrl: '',
      },
    },
    search,
    user,
    submissions,
    inspect,
    exceptions,
    authors,
    ui,
  };
}

export function getStore() {
  const mockStore = configureMockStore([thunkMiddleware]);
  return mockStore(getState());
}

export function getStoreWithState(state) {
  const mockStore = configureMockStore([thunkMiddleware]);
  return mockStore({ ...getState(), ...state });
}
