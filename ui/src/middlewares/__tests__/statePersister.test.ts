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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(key:... Remove this comment to see the full error message
    storage.set.mockClear();
  });

  
  describe('createPersistToStorageMiddleware', () => {
    
    it('persists state to local storage for given reducer names', async () => {
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'REDUCERS_TO_PERSISTS' because it... Remove this comment to see the full error message
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        {
          name: 'b',
          initialState: fromJS({}),
          statePath: ['subState1', 'subState2'],
        },
      ];
      const getState = () => ({
        a: fromJS({ foo: 'A' }),
        b: fromJS({ subState1: { subState2: { bar: 'B' } } }),
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

      expect(storage.set).toHaveBeenCalledWith(
        getStorageKeyForReducer('b', ['subState1', 'subState2']),
        {
          bar: 'B',
        }
      );

      expect(storage.set).toHaveBeenCalledTimes(2);
    });
  });

  
  describe('reHydrateRootStateFromStorage', () => {
    
    it('returns root state with data from local storage', () => {
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'REDUCERS_TO_PERSISTS' because it... Remove this comment to see the full error message
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        { name: 'b', initialState: fromJS({}) },
      ];

      
      storage.getSync = jest.fn().mockImplementation((key: any) => {
        const store = {
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
          [getStorageKeyForReducer('a')]: { foo: 'A' },
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
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
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'REDUCERS_TO_PERSISTS' because it... Remove this comment to see the full error message
      reducersModule.REDUCERS_TO_PERSISTS = [
        { name: 'a', initialState: fromJS({}) },
        { name: 'b', initialState: fromJS({}) },
      ];

      
      storage.getSync = jest.fn().mockImplementation((key: any) => {
        const store = {
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
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
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'REDUCERS_TO_PERSISTS' because it... Remove this comment to see the full error message
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
      
      storage.getSync = jest.fn().mockImplementation((key: any) => {
        const store = {
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
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
