import Piwik from 'react-piwik';
import { List } from 'immutable';
import { vi } from 'vitest';
import { setUserCategoryFromRoles, injectTrackerToHistory } from '../tracker';

vi.mock('react-piwik');
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

  describe('injectTrackerToHistory', () => {
    it('unwraps redux-first-history { location, action } into a bare location for react-piwik', () => {
      let emit: (update: unknown) => void = () => {};
      const reduxHistory = {
        location: { pathname: '/literature', search: '?q=higgs' },
        action: 'REPLACE',
        listen: (cb: (update: unknown) => void) => {
          emit = cb;
          return () => {};
        },
      };

      const connectToHistory = vi.fn((h) => h);
      vi.mocked(Piwik).mockImplementation(
        () => ({ connectToHistory }) as unknown as Piwik
      );

      const result = injectTrackerToHistory(reduxHistory);
      expect(result).toBe(reduxHistory);

      const historyForTracker = connectToHistory.mock.calls[0][0] as {
        listen: (cb: (loc: unknown) => void) => void;
      };
      const received: Array<{ pathname?: string; location?: unknown }> = [];
      historyForTracker.listen((loc) =>
        received.push(loc as { pathname?: string })
      );

      emit({
        location: { pathname: '/literature', search: '?q=zboson' },
        action: 'PUSH',
      });

      expect(received).toHaveLength(1);
      expect(received[0].pathname).toBe('/literature');
    });
  });
});
