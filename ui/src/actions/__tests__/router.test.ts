import { replace } from 'connected-react-router';

import { getStoreWithState } from '../../fixtures/store';
import { appendQueryToLocationSearch } from '../router';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('router', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('appendQueryToLocationSearch', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates router.replace with new search', () => {
      const currentLocation = {
        pathname: '/pathname',
        search: '?foo=bar',
        query: { foo: 'bar' },
      };
      const store = getStoreWithState({
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
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
