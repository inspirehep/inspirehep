import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Map, List } from 'immutable';
import { renderWithRouter } from '../../../../fixtures/render';
import { resolveDecision } from '../../../utils/utils';
import LiteratureDecisionBox from '../LiteratureDecisionBox';
import { LITERATURE } from '../../../../common/routes';
import { WorkflowDecisions } from '../../../../common/constants';

describe('<LiteratureDecisionBox />', () => {
  test('uses resolveDecision to derive tag text and class when a known action is provided', () => {
    const action = WorkflowDecisions.ACCEPT;
    const resolved = resolveDecision(action);

    const decision = Map({ action });
    const inspireCategories = List(['hep']);
    const relevancePrediction = Map({ decision: 'CORE', max_score: 0.88 });

    const { container } = renderWithRouter(
      <LiteratureDecisionBox
        decision={decision}
        controlNumber={undefined}
        inspireCategories={inspireCategories}
        relevancePrediction={relevancePrediction}
      />
    );
    expect(screen.getByText(resolved.decision)).toBeInTheDocument();

    const tagEl = container.querySelector('.decision-pill');
    expect(tagEl).toBeInTheDocument();
    if (resolved?.bg) {
      expect(tagEl).toHaveClass(resolved.bg);
    }
  });

  test('renders controlNumber link with correct URL and label', () => {
    const decision = Map({ action: WorkflowDecisions.ACCEPT });
    const inspireCategories = List(['hep']);
    const relevancePrediction = Map({ decision: 'CORE', max_score: 0.77 });
    const controlNumber = '12345';

    renderWithRouter(
      <LiteratureDecisionBox
        decision={decision}
        controlNumber={controlNumber}
        inspireCategories={inspireCategories}
        relevancePrediction={relevancePrediction}
      />
    );

    const link = screen.getByRole('link', { name: controlNumber });
    expect(link).toBeInTheDocument();

    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`${LITERATURE}/${controlNumber}`)
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});
