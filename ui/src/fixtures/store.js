import configureMockStore from 'redux-mock-store';

import { thunkMiddleware } from '../store';
import { initialState as search } from '../reducers/search';
import { initialState as literature } from '../reducers/literature';
import { initialState as user } from '../reducers/user';

export function getState() {
  return {
    literature,
    router: {
      location: {
        query: {},
      },
    },
    search,
    user,
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
