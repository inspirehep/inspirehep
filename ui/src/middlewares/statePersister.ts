import { fromJS, setIn, isImmutable } from 'immutable';
import { REDUCERS_TO_PERSISTS } from '../reducers';
import storage from '../common/storage';

export function getStorageKeyForReducer(reducerName: any, statePath: any) {
  let pathString = '';
  if (statePath != null) {
    pathString = `.${statePath.join('.')}`;
  }
  return `state.${reducerName}${pathString}`;
}

export function reHydrateRootStateFromStorage() {
  return REDUCERS_TO_PERSISTS.map(({ name, initialState, statePath }) => {
    // TODO: set up async rehydration, and remove `getSync`
    const subState = storage.getSync(getStorageKeyForReducer(name, statePath));

    if (subState == null) {
      // set undefined in order to skip reHydrating
      return { [name]: undefined };
    }

    let state = {};
    // merge persisted on top of initialState in order to keep persisted state updated
    // when initialState structure is changed
    if (statePath) {
      state = fromJS(setIn({}, statePath, subState));
    } else {
      state = fromJS(subState);
    }

    return { [name]: initialState.mergeDeep(state) };
  }).reduce((state, partialState) => Object.assign(state, partialState));
}

export function createPersistToStorageMiddleware() {
  const writeStateToStorage = async (state: any) => {
    REDUCERS_TO_PERSISTS.forEach(({ name, statePath }) => {
      const key = getStorageKeyForReducer(name, statePath);
      if (statePath == null) {
        storage.set(key, state[name].toJS());
      } else {
        let partialState = state[name].getIn(statePath);
        if (isImmutable(partialState)) {
          partialState = partialState.toJS();
        }
        storage.set(key, partialState);
      }
    });
  };

  return ({
    getState
  }: any) => (next: any) => (action: any) => {
    const result = next(action);
    writeStateToStorage(getState());
    return result;
  };
}
