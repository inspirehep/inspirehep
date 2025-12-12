import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import ResultItem from '../ResultItem';
import { renderWithProviders } from '../../../../../fixtures/render';
import { BACKOFFICE_AUTHORS_SEARCH } from '../../../../../common/routes';
import { WorkflowStatuses, WorkflowTypes } from '../../../../constants';

describe('ResultItem component', () => {
  const renderComponent = (workflowType: string, data: any) => {
    const item = fromJS({
      id: '123',
      workflow_type: workflowType,
      status: WorkflowStatuses.COMPLETED,
      decisions: fromJS([
        {
          action: 'accept',
        },
      ]),
      data,
    });

    return renderWithProviders(<ResultItem item={item} />, {
      route: BACKOFFICE_AUTHORS_SEARCH,
    });
  };

  it('renders the ResultItem component for Authors', () => {
    const data = fromJS({
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
    });

    renderComponent(WorkflowTypes.AUTHOR_UPDATE, data);

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
  });
});
