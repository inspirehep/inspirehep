import { fromJS } from 'immutable';
import { screen } from '@testing-library/react';

import { renderWithRouter } from '../../../fixtures/render';
import AiSearchAnswer, {
  LOADING_MESSAGES,
  stripIncompleteReference,
} from '../AiSearchAnswer';

describe('AiSearchAnswer', () => {
  describe('stripIncompleteReference', () => {
    it('hides a reference that is still being written', () => {
      expect(stripIncompleteReference('Discovered in 2012 by [Aad')).toBe(
        'Discovered in 2012 by '
      );
      expect(
        stripIncompleteReference('Discovered by [Aad et al. (2012)](11243')
      ).toBe('Discovered by ');
      expect(stripIncompleteReference('Discovered by [Aad et al.](')).toBe(
        'Discovered by '
      );
    });

    it('keeps references that are complete', () => {
      const answer = 'Discovered by [Aad et al. (2012)](1124337) at the LHC.';
      expect(stripIncompleteReference(answer)).toBe(answer);
    });

    it('keeps text without any reference', () => {
      expect(stripIncompleteReference('The Higgs boson')).toBe(
        'The Higgs boson'
      );
    });
  });

  it('shows a single loading message before the assistant answers', () => {
    renderWithRouter(
      <AiSearchAnswer
        aiSearch={fromJS({ loading: true, response: null, progress: [] })}
      />
    );

    const shown = LOADING_MESSAGES.filter((message) =>
      screen.queryByText(message)
    );
    expect(shown).toHaveLength(1);
  });

  it('drops the loading message once the assistant starts searching', () => {
    renderWithRouter(
      <AiSearchAnswer
        aiSearch={fromJS({
          loading: true,
          response: null,
          progress: [
            { type: 'tool', name: 'search_papers', input: { query: 'higgs' } },
          ],
        })}
      />
    );

    const shown = LOADING_MESSAGES.filter((message) =>
      screen.queryByText(message)
    );
    expect(shown).toHaveLength(0);
    expect(
      screen.getByText('Searching INSPIRE for “higgs”')
    ).toBeInTheDocument();
  });

  it('shows what the assistant searched for, but not what it found', () => {
    renderWithRouter(
      <AiSearchAnswer
        aiSearch={fromJS({
          loading: true,
          response: null,
          progress: [
            {
              type: 'tool',
              name: 'search_papers',
              input: { query: 'higgs self-coupling', count: 10 },
            },
            { type: 'tool_result', name: 'search_papers', total_results: 132 },
          ],
        })}
      />
    );

    expect(
      screen.getByText('Searching INSPIRE for “higgs self-coupling”')
    ).toBeInTheDocument();
    expect(screen.queryByText(/132/)).not.toBeInTheDocument();
  });

  it('links the papers in an answer that is still streaming', () => {
    renderWithRouter(
      <AiSearchAnswer
        aiSearch={fromJS({
          loading: true,
          progress: [],
          response: 'Found by [Aad et al. (2012)](1124337) and [CMS](112',
        })}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Aad et al. (2012)' })
    ).toHaveAttribute('href', '/literature/1124337');
    expect(screen.queryByText(/\[CMS\]/)).not.toBeInTheDocument();
  });

  it('renders the finished answer with its disclaimer', () => {
    renderWithRouter(
      <AiSearchAnswer
        aiSearch={fromJS({
          loading: false,
          progress: [],
          response: 'Found by [Aad et al. (2012)](1124337).',
          recordIds: [1124337],
        })}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Aad et al. (2012)' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Always verify against/)).toBeInTheDocument();
  });
});
