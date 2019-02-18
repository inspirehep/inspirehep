import { fromJS } from 'immutable';
import debounce from 'lodash.debounce';

export function getStorageKeyForReducer(reducerName) {
  return `state.${reducerName}`;
}

export function reHydrateRootStateFromStorage(reducerNames) {
  return reducerNames
    .map(reducerName => {
      const rawSubState = localStorage.getItem(
        getStorageKeyForReducer(reducerName)
      );
      
      if (rawSubState === null) {
        return { [reducerName]: undefined };
      }

      const state = fromJS(JSON.parse(rawSubState));
      return { [reducerName]: state };
    })
    .reduce((state, partialState) => Object.assign(state, partialState));
}

export function createPersistToStorageMiddleware(
  reducerNames,
  debounceTime = 5000
) {
  const writeStateToStorage = debounce(state => {
    reducerNames.forEach(reducerName => {
      const key = getStorageKeyForReducer(reducerName);
      const serializedData = JSON.stringify(state[reducerName]);
      localStorage.setItem(key, serializedData);
    });
  }, debounceTime);

  return ({ getState }) => next => action => {
    const result = next(action);
    writeStateToStorage(getState());
    return result;
  };
}
