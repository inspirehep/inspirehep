import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Map } from 'immutable';
import AutomaticDecision from '../AutomaticDecision';

describe('<AutomaticDecision />', () => {
  test('renders null when inspireCategories is empty', () => {
    const relevancePrediction = Map({
      decision: 'CORE',
      max_score: 0.9,
    });

    const { container } = render(
      <AutomaticDecision
        hasInspireCategories={false}
        relevancePrediction={relevancePrediction}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders null when relevancePrediction is missing', () => {
    const { container } = render(
      <AutomaticDecision hasInspireCategories relevancePrediction={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders CORE with class and formatted score', () => {
    const relevancePrediction = Map({
      decision: 'CORE',
      max_score: 0.875,
    });

    render(
      <AutomaticDecision
        hasInspireCategories
        relevancePrediction={relevancePrediction}
      />
    );

    expect(screen.getByText(/Automatic Decision:/i)).toBeInTheDocument();

    const decisionEl = screen.getByText('CORE 0.88');
    expect(decisionEl).toBeInTheDocument();
    expect(decisionEl).toHaveClass('text-core');
  });

  test('renders Non-CORE with class and formatted score', () => {
    const relevancePrediction = Map({ decision: 'Non-CORE', max_score: 0.95 });

    render(
      <AutomaticDecision
        hasInspireCategories
        relevancePrediction={relevancePrediction}
      />
    );

    const decisionEl = screen.getByText('Non-CORE 0.95');
    expect(decisionEl).toBeInTheDocument();
    expect(decisionEl).toHaveClass('text-non-core');
  });

  test('renders rejected (lowercase key) with correct class and score', () => {
    const relevancePrediction = Map({
      decision: 'rejected',
      max_score: 0.5,
    });

    render(
      <AutomaticDecision
        hasInspireCategories
        relevancePrediction={relevancePrediction}
      />
    );

    const decisionEl = screen.getByText('Rejected 0.50');
    expect(decisionEl).toBeInTheDocument();
    expect(decisionEl).toHaveClass('text-rejected');
  });
});
