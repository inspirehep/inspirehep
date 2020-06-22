import configureMockStore from 'redux-mock-store';

import { initialState as citations } from '../reducers/citations';
import { initialState as search } from '../reducers/search';
import { initialState as literature } from '../reducers/literature';
import { initialState as user } from '../reducers/user';
import { initialState as submissions } from '../reducers/submissions';
import { initialState as inspect } from '../reducers/inspect';
import { initialState as exceptions } from '../reducers/exceptions';
import { initialState as ui } from '../reducers/ui';
import { initialState as bibliographyGenerator } from '../reducers/bibliographyGenerator';

import { thunkMiddleware } from '../store';
import { initialState } from '../reducers/recordsFactory';

export function getState() {
  return {
    citations,
    literature,
    router: {
      location: {
        pathname: '/',
        query: {
          size: 25,
        },
        previousUrl: '',
      },
    },
    search,
    user,
    submissions,
    inspect,
    exceptions,
    authors: initialState,
    ui,
    jobs: initialState,
    conferences: initialState,
    bibliographyGenerator,
    seminars: initialState,
    institutions: initialState,
    experiments: initialState,
  };
}

export function mockActionCreator(actionCreator) {
  const mockedImplementation = (...args) => ({
    type: actionCreator.name,
    payload: args,
  });

  actionCreator.mockImplementation(mockedImplementation);
}

export function getStore(overrideState = {}) {
  const mockStore = configureMockStore([thunkMiddleware]);
  return mockStore({ ...getState(), ...overrideState });
}

/**
 * DEPRECATED! use `getStore` instead
 */
export function getStoreWithState(state) {
  const mockStore = configureMockStore([thunkMiddleware]);
  return mockStore({ ...getState(), ...state });
}
