import configureMockStore from 'redux-mock-store';

import { thunkMiddleware } from '../store';
import { initialState as search } from '../reducers/search';

export function getState() {
  return {
    router: {
      location: {
        query: {},
      },
    },
    search,
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
