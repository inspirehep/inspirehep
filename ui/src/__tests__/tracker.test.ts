// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import Piwik from 'react-piwik';
import { List } from 'immutable';

import { setUserCategoryFromRoles } from '../tracker';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-piwik');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('tracker', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
  beforeAll(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Window &... Remove this comment to see the full error message
    window.CONFIG = {};
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Window &... Remove this comment to see the full error message
    window.CONFIG = {
      REACT_APP_PIWIK_URL: 'some',
      REACT_APP_PIWIK_SITE_ID: '1',
    };
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Window &... Remove this comment to see the full error message
    window.CONFIG = {};
    Piwik.push.mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('setUserCategoryFromRoles', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets Superuser if user has superuser role', async () => {
      await setUserCategoryFromRoles(List(['superuser', 'cataloger']));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'Superuser',
      ]);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets Cataloger if user has cataloger role', async () => {
      await setUserCategoryFromRoles(List(['cataloger', 'another']));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'Cataloger',
      ]);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets User if user does not have superuser or cataloger role', async () => {
      await setUserCategoryFromRoles(List(['another']));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'User',
      ]);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets User if user does not have any role', async () => {
      await setUserCategoryFromRoles(List([]));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(Piwik.push).toHaveBeenCalledWith([
        'setCustomVariable',
        1,
        'UserCategory',
        'User',
      ]);
    });
  });
});
