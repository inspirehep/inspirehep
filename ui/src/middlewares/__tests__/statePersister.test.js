import { fromJS } from 'immutable';

import {
  createPersistToStorageMiddleware,
  getStorageKeyForReducer,
  reHydrateRootStateFromStorage,
} from '../statePersister';

import * as reducersModule from '../../reducers';

jest.mock('../../reducers');

describe('statePersister', () => {
  afterEach(() => {
    localStorage.clear();
    localStorage.setItem.mockClear();
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
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        { name: 'b', initialState: fromJS({}) },
      ];
      localStorage.setItem(getStorageKeyForReducer('a'), '{"foo":"A"}');
      localStorage.setItem(getStorageKeyForReducer('b'), '{"bar":"B"}');
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
      localStorage.setItem(getStorageKeyForReducer('a'), '{"foo":"A"}');
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
      localStorage.setItem(
        getStorageKeyForReducer('a'),
        '{"foo":"A", "deep":{"child":"child2"}}'
      );
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
