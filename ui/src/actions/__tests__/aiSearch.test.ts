import { fromJS } from 'immutable';

import {
  AI_SEARCH_LOGIN_REQUIRED_MESSAGE,
  fetchAiSearchResults,
  isAiSearchQuery,
  stripAiSearchPrefix,
} from '../aiSearch';
import { AI_SEARCH_ERROR } from '../actionTypes';
import { getStore } from '../../fixtures/store';
import { LITERATURE_NS } from '../../search/constants';
import { getConfigFor } from '../../common/config';

vi.mock('../../common/config');

const mockGetConfigFor = vi.mocked(getConfigFor);

describe('aiSearch', () => {
  describe('isAiSearchQuery', () => {
    beforeEach(() => {
      mockGetConfigFor.mockReturnValue(true);
    });

    it('detects the `ai:` prefix regardless of case and spacing', () => {
      expect(isAiSearchQuery('ai: literature about the higgs')).toBe(true);
      expect(isAiSearchQuery('AI:literature about the higgs')).toBe(true);
      expect(isAiSearchQuery('  Ai:   the higgs  ')).toBe(true);
    });

    it('does not detect ordinary queries', () => {
      expect(isAiSearchQuery('t higgs')).toBe(false);
      expect(isAiSearchQuery('a ai')).toBe(false);
      expect(isAiSearchQuery('paper about ai: models')).toBe(false);
      expect(isAiSearchQuery('')).toBe(false);
      expect(isAiSearchQuery(undefined)).toBe(false);
    });

    it('is disabled when the feature flag is off', () => {
      mockGetConfigFor.mockReturnValue(false);
      expect(isAiSearchQuery('ai: literature about the higgs')).toBe(false);
    });
  });

  describe('fetchAiSearchResults', () => {
    it('asks the user to log in instead of calling the assistant', async () => {
      mockGetConfigFor.mockReturnValue(true);
      const store = getStore({
        search: fromJS({
          namespaces: {
            [LITERATURE_NS]: { query: { q: 'ai: the higgs' }, aiSearch: null },
          },
        }),
        user: fromJS({ loggedIn: false }),
      });

      await store.dispatch(fetchAiSearchResults(LITERATURE_NS) as any);

      const error = store
        .getActions()
        .find((action: { type: string }) => action.type === AI_SEARCH_ERROR);
      expect(error.payload.error.message).toBe(
        AI_SEARCH_LOGIN_REQUIRED_MESSAGE
      );
    });
  });

  describe('stripAiSearchPrefix', () => {
    it('returns the question without the prefix', () => {
      expect(stripAiSearchPrefix('ai: literature about the higgs')).toBe(
        'literature about the higgs'
      );
      expect(stripAiSearchPrefix('  AI:the higgs  ')).toBe('the higgs');
    });
  });
});
