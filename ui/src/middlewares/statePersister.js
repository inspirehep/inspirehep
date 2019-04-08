import { fromJS } from 'immutable';
import { REDUCERS_TO_PERSISTS } from '../reducers';

export function getStorageKeyForReducer(reducerName) {
  return `state.${reducerName}`;
}

export function reHydrateRootStateFromStorage() {
  return REDUCERS_TO_PERSISTS.map(({ name, initialState }) => {
    const rawSubState = localStorage.getItem(getStorageKeyForReducer(name));

    if (rawSubState === null) {
      // set undefined in order to skip reHydrating
      return { [name]: undefined };
    }

    const state = fromJS(JSON.parse(rawSubState));
    // merge persisted on top of initialState in order to keep persisted state updated
    // when initialState structure is changed
    return { [name]: initialState.mergeDeep(state) };
  }).reduce((state, partialState) => Object.assign(state, partialState));
}

export function createPersistToStorageMiddleware() {
  const writeStateToStorage = async state => {
    REDUCERS_TO_PERSISTS.forEach(({ name }) => {
      const key = getStorageKeyForReducer(name);
      const serializedData = JSON.stringify(state[name]);
      localStorage.setItem(key, serializedData);
    });
  };

  return ({ getState }) => next => action => {
    const result = next(action);
    writeStateToStorage(getState());
    return result;
  };
}
