import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { List, Map } from 'immutable';
import LiteratureKeywords from '../LiteratureKeywords';

describe('LiteratureKeywords', () => {
  const classifierResults = Map({
    fulltext_used: true,
    complete_output: Map({
      core_keywords: List([
        Map({ number: 6, keyword: 'qubit' }),
        Map({ number: 5, keyword: 'quantum device' }),
      ]),
      filtered_core_keywords: List([
        Map({ number: 6, keyword: 'qubit' }),
        Map({ number: 5, keyword: 'quantum device' }),
        Map({ number: 2, keyword: 'computer, quantum' }),
      ]),
    }),
  });

  test('renders nothing when classifierResults is missing', () => {
    const { container } = render(<LiteratureKeywords />);
    expect(container.firstChild).toBeNull();
  });

  test('shows core count and “fulltext” when fulltext_used is true', () => {
    render(<LiteratureKeywords classifierResults={classifierResults} />);

    expect(
      screen.getByText(/2 core keywords from fulltext/i)
    ).toBeInTheDocument();
  });

  test('shows “metadata” when fulltext_used is false', () => {
    const classifierResultsAltered = Map({
      fulltext_used: false,
      complete_output: Map({
        core_keywords: List([
          Map({ number: 6, keyword: 'qubit' }),
          Map({ number: 5, keyword: 'quantum device' }),
        ]),
        filtered_core_keywords: List([
          Map({ number: 6, keyword: 'qubit' }),
          Map({ number: 5, keyword: 'quantum device' }),
          Map({ number: 2, keyword: 'computer, quantum' }),
        ]),
      }),
    });

    render(<LiteratureKeywords classifierResults={classifierResultsAltered} />);

    expect(
      screen.getByText(/2 core keywords from metadata/i)
    ).toBeInTheDocument();
  });

  test('renders filtered section with correct count and items', () => {
    render(<LiteratureKeywords classifierResults={classifierResults} />);

    expect(screen.getByText(/^3 Filtered/i)).toBeInTheDocument();

    expect(screen.getByText('qubit')).toBeInTheDocument();
    expect(screen.getByText('quantum device')).toBeInTheDocument();
    expect(screen.getByText('computer, quantum')).toBeInTheDocument();

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders a row per filtered keyword', () => {
    const { container } = render(
      <LiteratureKeywords classifierResults={classifierResults} />
    );

    const rows = container.querySelectorAll(
      '.decision-filtered-core-keywords-list-inner'
    );
    expect(rows.length).toBe(3);
  });

  test('handles missing lists safely (0 counts, no rows)', () => {
    const emptyClassifierResults = Map({
      complete_output: Map({}),
      fulltext_used: false,
    });

    const { container } = render(
      <LiteratureKeywords classifierResults={emptyClassifierResults} />
    );

    expect(
      screen.getByText(/0 core keywords from metadata/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/0 Filtered$/i)).toBeInTheDocument();

    const rows = container.querySelectorAll(
      '.decision-filtered-core-keywords-list-inner'
    );
    expect(rows.length).toBe(0);
  });
});
