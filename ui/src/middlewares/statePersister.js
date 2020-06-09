import { fromJS } from 'immutable';
import { REDUCERS_TO_PERSISTS } from '../reducers';
import storage from '../common/storage';

export function getStorageKeyForReducer(reducerName) {
  return `state.${reducerName}`;
}

export function reHydrateRootStateFromStorage() {
  return REDUCERS_TO_PERSISTS.map(({ name, initialState }) => {
    // TODO: set up async rehydration, and remove `getSync`
    const subState = storage.getSync(getStorageKeyForReducer(name));

    if (subState == null) {
      // set undefined in order to skip reHydrating
      return { [name]: undefined };
    }

    const state = fromJS(subState);
    // merge persisted on top of initialState in order to keep persisted state updated
    // when initialState structure is changed
    return { [name]: initialState.mergeDeep(state) };
  }).reduce((state, partialState) => Object.assign(state, partialState));
}

export function createPersistToStorageMiddleware() {
  const writeStateToStorage = async state => {
    REDUCERS_TO_PERSISTS.forEach(({ name }) => {
      const key = getStorageKeyForReducer(name);
      storage.set(key, state[name].toJS());
    });
  };

  return ({ getState }) => next => action => {
    const result = next(action);
    writeStateToStorage(getState());
    return result;
  };
}
