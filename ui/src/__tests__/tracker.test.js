import Piwik from 'react-piwik';
import { Set } from 'immutable';

import { setUserCategoryFromRoles } from '../tracker';

jest.mock('react-piwik');

Piwik.push = jest.fn();

function setPiwikConfig() {
  process.env.REACT_APP_PIWIK_URL = 'some';
  process.env.REACT_APP_PIWIK_SITE_ID = '1';
}

function resetPiwikConfig() {
  process.env.REACT_APP_PIWIK_URL = undefined;
  process.env.REACT_APP_PIWIK_SITE_ID = undefined;
}

describe('tracker', () => {
  beforeEach(() => {
    setPiwikConfig();
  });

  afterEach(() => {
    resetPiwikConfig();
  });

  describe('setUserCategoryFromRoles', () => {
    it('sets Superuser if user has superuser role', async () => {
      await setUserCategoryFromRoles(Set(['superuser', 'cataloger']));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'Superuser',
      ]);
    });

    it('sets Cataloger if user has cataloger role', async () => {
      await setUserCategoryFromRoles(Set(['cataloger', 'another']));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'Cataloger',
      ]);
    });

    it('sets User if user does not have superuser or cataloger role', async () => {
      await setUserCategoryFromRoles(Set(['another']));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'User',
      ]);
    });

    it('sets User if user does not have any role', async () => {
      await setUserCategoryFromRoles(Set([]));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'User',
      ]);
    });
  });
});
