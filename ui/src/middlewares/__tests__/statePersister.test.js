import { fromJS } from 'immutable';

import {
  createPersistToStorageMiddleware,
  getStorageKeyForReducer,
  reHydrateRootStateFromStorage,
} from '../statePersister';

import * as reducersModule from '../../reducers';
import storage from '../../common/storage';

jest.mock('../../reducers');
jest.mock('../../common/storage');

describe('statePersister', () => {
  afterEach(() => {
    storage.set.mockClear();
  });

  describe('createPersistToStorageMiddleware', () => {
    it('persists state to local storage for given reducer names', async () => {
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        { name: 'b', initialState: fromJS({}) },
      ];
      const getState = () => ({
        a: fromJS({ foo: 'A' }),
        b: fromJS({ bar: 'B' }),
        c: fromJS({ whatever: 'thing' }),
      });
      const middleware = createPersistToStorageMiddleware();
      const next = jest.fn();
      const dispatch = middleware({ getState })(next);

      const action = { type: 'WHATEVER' };
      dispatch(action);
      expect(next).toHaveBeenCalledWith(action);

      expect(storage.set).toHaveBeenCalledWith(getStorageKeyForReducer('a'), {
        foo: 'A',
      });
      expect(storage.set).toHaveBeenCalledWith(getStorageKeyForReducer('b'), {
        bar: 'B',
      });
      expect(storage.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('reHydrateRootStateFromStorage', () => {
    it('returns root state with data from local storage', () => {
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        { name: 'b', initialState: fromJS({}) },
      ];

      storage.getSync = jest.fn().mockImplementation(key => {
        const store = {
          [getStorageKeyForReducer('a')]: { foo: 'A' },
          [getStorageKeyForReducer('b')]: { bar: 'B' },
        };
        return store[key];
      });
      const expected = {
        a: fromJS({ foo: 'A' }),
        b: fromJS({ bar: 'B' }),
      };
      const state = reHydrateRootStateFromStorage();
      expect(state).toEqual(expected);
    });

    it('returns undefined if there is no state for a reducer', () => {
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        { name: 'b', initialState: fromJS({}) },
      ];

      storage.getSync = jest.fn().mockImplementation(key => {
        const store = {
          [getStorageKeyForReducer('a')]: { foo: 'A' },
        };
        return store[key];
      });

      const expected = {
        a: fromJS({ foo: 'A' }),
        b: undefined,
      };
      const state = reHydrateRootStateFromStorage();
      expect(state).toEqual(expected);
    });

    it('merges localStore state on top of initialState while reHydrate', () => {
      reducersModule.REDUCERS_TO_PERSISTS = [
        {
          name: 'a',
          initialState: fromJS({
            foo: 'default',
            bar: 'default',
            deep: { child: 'child1', another: 'value' },
          }),
        },
      ];
      storage.getSync = jest.fn().mockImplementation(key => {
        const store = {
          [getStorageKeyForReducer('a')]: {
            foo: 'A',
            deep: { child: 'child2' },
          },
        };
        return store[key];
      });

      const expected = {
        a: fromJS({
          foo: 'A',
          bar: 'default',
          deep: { child: 'child2', another: 'value' },
        }),
      };
      const state = reHydrateRootStateFromStorage();
      expect(state).toEqual(expected);
    });
  });
});
