import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import {
  AI_SEARCH_INCOMPLETE_MESSAGE,
  AI_SEARCH_LOGIN_REQUIRED_MESSAGE,
  fetchAiSearchResults,
  isAiSearchQuery,
  stripAiSearchPrefix,
} from '../aiSearch';
import {
  AI_SEARCH_CHUNK,
  AI_SEARCH_ERROR,
  AI_SEARCH_PROGRESS,
  AI_SEARCH_SUCCESS,
} from '../actionTypes';
import { getStore } from '../../fixtures/store';
import { LITERATURE_NS } from '../../search/constants';
import { getConfigFor } from '../../common/config';
import http from '../../common/http';

vi.mock('../../common/config');

const mockGetConfigFor = vi.mocked(getConfigFor);
const mockHttp = new MockAdapter((http as any).httpClient);

function streamingResponse(events: object[], status = 200) {
  const encoder = new TextEncoder();
  const chunks = events.map((event) =>
    encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
  );
  let index = 0;

  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({}),
    body: {
      getReader: () => ({
        read: async () =>
          index < chunks.length
            ? { done: false, value: chunks[index++] }
            : { done: true, value: undefined },
      }),
    },
  };
}

function loggedInStore() {
  return getStore({
    search: fromJS({
      namespaces: {
        [LITERATURE_NS]: { query: { q: 'ai: the higgs' }, aiSearch: null },
      },
    }),
    user: fromJS({ loggedIn: true }),
  });
}

describe('aiSearch', () => {
  beforeEach(() => {
    mockGetConfigFor.mockReturnValue(true);
    mockHttp.onAny().reply(200, { hits: { hits: [], total: 0 } });
  });

  afterEach(() => {
    mockHttp.reset();
    vi.unstubAllGlobals();
  });

  describe('isAiSearchQuery', () => {
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

  describe('stripAiSearchPrefix', () => {
    it('returns the question without the prefix', () => {
      expect(stripAiSearchPrefix('ai: literature about the higgs')).toBe(
        'literature about the higgs'
      );
      expect(stripAiSearchPrefix('  AI:the higgs  ')).toBe('the higgs');
    });
  });

  describe('fetchAiSearchResults', () => {
    it('asks the user to log in instead of calling the assistant', async () => {
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

    it('reports progress and the answer as they stream in', async () => {
      const events = [
        { type: 'status', stage: 'connecting' },
        { type: 'tool', name: 'search_papers', input: { query: 'higgs' } },
        { type: 'tool_result', name: 'search_papers', total_results: 132 },
        { type: 'answer', text: 'See ' },
        { type: 'answer', text: '[Aad et al. (2012)](1124337).' },
        {
          type: 'done',
          response: 'See [Aad et al. (2012)](1124337).',
          record_ids: [1124337],
          records_api_url: '',
        },
      ];
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(streamingResponse(events))
      );
      const store = loggedInStore();

      await store.dispatch(fetchAiSearchResults(LITERATURE_NS) as any);
      const actions = store.getActions();

      expect(
        actions
          .filter((action: any) => action.type === AI_SEARCH_PROGRESS)
          .map((action: any) => action.payload.event.type)
      ).toEqual(['status', 'tool', 'tool_result']);
      expect(
        actions
          .filter((action: any) => action.type === AI_SEARCH_CHUNK)
          .map((action: any) => action.payload.text)
      ).toEqual(['See ', '[Aad et al. (2012)](1124337).']);

      const success = actions.find(
        (action: any) => action.type === AI_SEARCH_SUCCESS
      );
      expect(success.payload.response).toBe(
        'See [Aad et al. (2012)](1124337).'
      );
      expect(success.payload.recordIds).toEqual([1124337]);
    });

    it('reports a stream that ends before the answer is done', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          streamingResponse([
            { type: 'status', stage: 'connecting' },
            { type: 'answer', text: 'The Higgs boson was disc' },
          ])
        )
      );
      const store = loggedInStore();

      await store.dispatch(fetchAiSearchResults(LITERATURE_NS) as any);
      const actions = store.getActions();

      const error = actions.find(
        (action: any) => action.type === AI_SEARCH_ERROR
      );
      expect(error.payload.error.message).toBe(AI_SEARCH_INCOMPLETE_MESSAGE);
      expect(
        actions.some((action: any) => action.type === AI_SEARCH_SUCCESS)
      ).toBe(false);
    });

    it('reports an error event streamed after the response started', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          streamingResponse([
            { type: 'status', stage: 'connecting' },
            { type: 'error', message: 'The AI search could not be completed.' },
          ])
        )
      );
      const store = loggedInStore();

      await store.dispatch(fetchAiSearchResults(LITERATURE_NS) as any);

      const error = store
        .getActions()
        .find((action: any) => action.type === AI_SEARCH_ERROR);
      expect(error.payload.error.message).toBe(
        'The AI search could not be completed.'
      );
      expect(
        store
          .getActions()
          .some((action: any) => action.type === AI_SEARCH_SUCCESS)
      ).toBe(false);
    });
  });
});
