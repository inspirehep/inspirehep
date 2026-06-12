import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Map } from 'immutable';
import { renderWithRouter } from '../../../../fixtures/render';
import { resolveDecision } from '../../../utils/utils';
import { WorkflowDecisions } from '../../../../common/constants';
import LiteratureDecisionDetails from '../LiteratureDecisionDetails';

describe('<LiteratureDecisionDetails />', () => {
  test('renders null when decision is missing', () => {
    const { container } = renderWithRouter(
      <LiteratureDecisionDetails decision={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders decision tag text and class for known action', () => {
    const action = WorkflowDecisions.ACCEPT;
    const resolved = resolveDecision(action);
    const decision = Map({ action });

    const { container } = renderWithRouter(
      <LiteratureDecisionDetails decision={decision} />
    );

    expect(screen.getByText(resolved.decision)).toBeInTheDocument();

    const tagEl = container.querySelector('.decision-pill');
    expect(tagEl).toBeInTheDocument();
    if (resolved?.bg) {
      expect(tagEl).toHaveClass(resolved.bg);
    }
  });
});
