import Piwik from 'react-piwik';
import { List } from 'immutable';

import { setUserCategoryFromRoles } from '../tracker';

jest.mock('react-piwik');
const mockedPiwik = Piwik as jest.Mocked<typeof Piwik>;

describe('tracker', () => {
  beforeAll(() => {
    window.CONFIG = {};
  });

  beforeEach(() => {
    window.CONFIG = {
      REACT_APP_PIWIK_URL: 'some',
      REACT_APP_PIWIK_SITE_ID: '1',
    };
  });

  afterEach(() => {
    window.CONFIG = {};
    mockedPiwik.push.mockClear();
  });

  describe('setUserCategoryFromRoles', () => {
    it('sets Superuser if user has superuser role', async () => {
      await setUserCategoryFromRoles(List(['superuser', 'cataloger']));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomDimension',
        1,
        'Superuser',
      ]);
    });

    it('sets Cataloger if user has cataloger role', async () => {
      await setUserCategoryFromRoles(List(['cataloger', 'another']));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomDimension',
        1,
        'Cataloger',
      ]);
    });

    it('sets User if user does not have superuser or cataloger role', async () => {
      await setUserCategoryFromRoles(List(['another']));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomDimension',
        1,
        'User',
      ]);
    });

    it('sets User if user does not have any role', async () => {
      await setUserCategoryFromRoles(List([]));
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomDimension',
        1,
        'User',
      ]);
    });
  });
});
