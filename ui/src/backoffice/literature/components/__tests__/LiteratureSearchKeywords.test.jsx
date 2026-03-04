import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { List, Map } from 'immutable';
import LiteratureSearchKeywords from '../LiteratureSearchKeywords';

describe('LiteratureSearchKeywords', () => {
  it('renders nothing without classifier results', () => {
    const { container } = render(<LiteratureSearchKeywords />);
    expect(container.firstChild).toBeNull();
  });

  it('shows filtered count/source and first 4 keywords by default', () => {
    const classifierResults = Map({
      fulltext_used: false,
      complete_output: Map({
        filtered_core_keywords: List([
          Map({ keyword: 'alpha' }),
          Map({ keyword: 'beta' }),
        ]),
        core_keywords: List([
          Map({ keyword: 'alpha' }),
          Map({ keyword: 'beta' }),
          Map({ keyword: 'gamma' }),
          Map({ keyword: 'delta' }),
          Map({ keyword: 'epsilon' }),
        ]),
      }),
    });

    render(<LiteratureSearchKeywords classifierResults={classifierResults} />);

    expect(
      screen.getByText(/2 Filtered core keywords from metadata/i)
    ).toBeInTheDocument();
    expect(screen.getByText('alpha, beta, gamma, delta')).toBeInTheDocument();
    expect(screen.queryByText(/epsilon/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Show all keywords/i })
    ).toBeInTheDocument();
  });

  it('toggles between show all and hide keywords', () => {
    const classifierResults = Map({
      fulltext_used: true,
      complete_output: Map({
        filtered_core_keywords: List([
          Map({ keyword: 'alpha' }),
          Map({ keyword: 'beta' }),
        ]),
        core_keywords: List([
          Map({ keyword: 'alpha' }),
          Map({ keyword: 'beta' }),
          Map({ keyword: 'gamma' }),
          Map({ keyword: 'delta' }),
          Map({ keyword: 'epsilon' }),
        ]),
      }),
    });

    render(<LiteratureSearchKeywords classifierResults={classifierResults} />);

    fireEvent.click(screen.getByRole('button', { name: /Show all keywords/i }));
    expect(
      screen.getByText('alpha, beta, gamma, delta, epsilon')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Hide keywords/i })
    ).toBeInTheDocument();
  });
});
