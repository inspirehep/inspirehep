import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../../fixtures/render';
import WorkflowResultItem from '../WorkflowResultItem';
import { BACKOFFICE_AUTHORS_SEARCH } from '../../../../common/routes';
import { WorkflowStatuses, WorkflowTypes } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';

describe('WorkflowResultItem component for Authors', () => {
  it('renders details, status and subject areas for an author workflow', () => {
    const item = fromJS({
      id: '123',
      workflow_type: WorkflowTypes.AUTHOR_UPDATE,
      status: WorkflowStatuses.COMPLETED,
      decisions: fromJS([
        {
          action: WorkflowDecisions.ACCEPT,
        },
      ]),
      data: fromJS({
        name: fromJS({
          value: 'Doe, John',
          preferred_name: 'Johnny',
        }),
        status: 'active',
        arxiv_categories: fromJS(['cs.AI', 'cs.CL']),
        acquisition_source: fromJS({
          datetime: '2025-01-07T16:29:31.315971',
          email: 'john.doe@cern.ch',
          method: 'submitter1',
          source: 'submitter2',
        }),
      }),
    });

    renderWithProviders(<WorkflowResultItem item={item} />, {
      route: BACKOFFICE_AUTHORS_SEARCH,
    });

    const titleLink = screen.getByRole('link', { name: /Doe, John/i });
    expect(titleLink).toHaveAttribute('href', '/backoffice/authors/123');

    expect(screen.getByText('Update')).toBeInTheDocument();

    const decisionPill = screen.getByText('Accept');
    expect(decisionPill).toBeInTheDocument();
    expect(decisionPill).toHaveClass('decision-pill bg-completed ml1');

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('submitter2')).toBeInTheDocument();
    expect(
      screen.getByText('This workflow has been completed.')
    ).toBeInTheDocument();
    expect(screen.getByText('john.doe@cern.ch')).toBeInTheDocument();
    expect(screen.getByText('cs.AI')).toBeInTheDocument();
    expect(screen.getByText('cs.CL')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Core' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
  });
});
