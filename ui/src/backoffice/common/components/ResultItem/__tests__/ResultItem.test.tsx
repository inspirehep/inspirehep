import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';

import ResultItem from '../ResultItem';
import { renderWithProviders } from '../../../../../fixtures/render';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../../../common/routes';
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

  const renderLiteratureComponent = (
    data: any,
    handleResolveAction: jest.Mock
  ) => {
    const item = fromJS({
      id: '456',
      workflow_type: WorkflowTypes.HEP_CREATE,
      status: WorkflowStatuses.APPROVAL,
      decisions: fromJS([
        {
          action: 'hep_accept_core',
        },
      ]),
      data,
    });

    return renderWithProviders(
      <ResultItem
        item={item}
        handleResolveAction={handleResolveAction}
        actionInProgress="hep_accept_core"
      />,
      {
        route: BACKOFFICE_LITERATURE_SEARCH,
      }
    );
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

    expect(screen.queryByRole('button', { name: 'Core' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reject' })).toBeNull();
  });

  it('calls resolve action from literature buttons', () => {
    const handleResolveAction = jest.fn();
    const data = fromJS({
      title: fromJS({
        title: 'Example title',
      }),
      inspire_categories: fromJS([{ term: 'hep-th' }]),
      acquisition_source: fromJS({
        datetime: '2025-01-07T16:29:31.315971',
        email: 'john.doe@cern.ch',
        method: 'submitter1',
        source: 'submitter2',
      }),
    });

    renderLiteratureComponent(data, handleResolveAction);

    fireEvent.click(screen.getByRole('button', { name: 'Core' }));

    expect(handleResolveAction).toHaveBeenCalledWith('hep_accept_core');
  });
});
