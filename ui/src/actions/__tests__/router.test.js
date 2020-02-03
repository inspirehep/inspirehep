import { replace } from 'connected-react-router';

import { getStoreWithState } from '../../fixtures/store';
import { setHash } from '../router';


describe('router', () => {
  it('create router.replace with new hash', () => {
    const currentLocation = { pathname: '/pathname', search: '?param=value', hash: '#whatever' };
    const store = getStoreWithState({
      router: {
        location: currentLocation
      }
    });
    const hash = '#hash';
    const expectedActions = [
      replace({ ...currentLocation, hash })
    ];

    store.dispatch(setHash(hash));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
