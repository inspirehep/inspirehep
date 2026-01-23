import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Map } from 'immutable';
import { renderWithRouter } from '../../../../fixtures/render';
import { resolveDecision } from '../../../utils/utils';
import { LITERATURE } from '../../../../common/routes';
import { WorkflowDecisions } from '../../../../common/constants';
import LiteratureDecisionDetails from '../LiteratureDecisionDetails';

describe('<LiteratureDecisionDetails />', () => {
  test('renders null when decision is missing', () => {
    const { container } = renderWithRouter(
      <LiteratureDecisionDetails
        decision={null}
        controlNumber={null}
        pidType={LITERATURE}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders decision tag text and class for known action', () => {
    const action = WorkflowDecisions.ACCEPT;
    const resolved = resolveDecision(action);
    const decision = Map({ action });

    const { container } = renderWithRouter(
      <LiteratureDecisionDetails
        decision={decision}
        controlNumber={null}
        pidType={LITERATURE}
      />
    );

    expect(screen.getByText(resolved.decision)).toBeInTheDocument();

    const tagEl = container.querySelector('.decision-pill');
    expect(tagEl).toBeInTheDocument();
    if (resolved?.bg) {
      expect(tagEl).toHaveClass(resolved.bg);
    }
  });

  test('renders control number link with correct URL', () => {
    const controlNumber = '12345';
    const decision = Map({ action: WorkflowDecisions.ACCEPT });

    renderWithRouter(
      <LiteratureDecisionDetails
        decision={decision}
        controlNumber={controlNumber}
        pidType={LITERATURE}
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
