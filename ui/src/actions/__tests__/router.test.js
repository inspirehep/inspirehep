import { replace } from 'connected-react-router';

import { getStore } from '../../fixtures/store';
import { appendQueryToLocationSearch } from '../router';

describe('router', () => {
  describe('appendQueryToLocationSearch', () => {
    it('creates router.replace with new search', () => {
      const currentLocation = {
        pathname: '/pathname',
        search: '?foo=bar',
        query: { foo: 'bar' },
      };
      const store = getStore({
        router: {
          location: currentLocation,
        },
      });
      const expectedActions = [
        replace({
          ...currentLocation,
          search: '?foo=bar&param1=value1&param2=value2',
        }),
      ];

      store.dispatch(
        appendQueryToLocationSearch({ param1: 'value1', param2: 'value2' })
      );
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
