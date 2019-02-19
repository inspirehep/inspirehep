import { fromJS } from 'immutable';

import {
  createPersistToStorageMiddleware,
  getStorageKeyForReducer,
  reHydrateRootStateFromStorage,
} from '../statePersister';

describe('statePersister', () => {
  afterEach(() => {
    localStorage.clear();
    localStorage.setItem.mockClear();
  });

  describe('createPersistToStorageMiddleware', () => {
    it('persists state to local storage for given reducer names', async () => {
      const getState = () => ({
        a: fromJS({ foo: 'A' }),
        b: fromJS({ bar: 'B' }),
        c: fromJS({ whatever: 'thing' }),
      });
      const middleware = createPersistToStorageMiddleware(['a', 'b']);
      const next = jest.fn();
      const dispatch = middleware({ getState })(next);

      const action = { type: 'WHATEVER' };
      dispatch(action);
      expect(next).toHaveBeenCalledWith(action);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        getStorageKeyForReducer('a'),
        '{"foo":"A"}'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        getStorageKeyForReducer('b'),
        '{"bar":"B"}'
      );
      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('reHydrateRootStateFromStorage', () => {
    it('returns root state with data from local storage', () => {
      localStorage.setItem(getStorageKeyForReducer('a'), '{"foo":"A"}');
      localStorage.setItem(getStorageKeyForReducer('b'), '{"bar":"B"}');
      const expected = {
        a: fromJS({ foo: 'A' }),
        b: fromJS({ bar: 'B' }),
      };
      const state = reHydrateRootStateFromStorage(['a', 'b']);
      expect(state).toEqual(expected);
    });

    it('returns undefined if there is no state for a reducer', () => {
      localStorage.setItem(getStorageKeyForReducer('a'), '{"foo":"A"}');
      const expected = {
        a: fromJS({ foo: 'A' }),
        b: undefined,
      };
      const state = reHydrateRootStateFromStorage(['a', 'b']);
      expect(state).toEqual(expected);
    });
  });
});


