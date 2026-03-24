import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../../fixtures/render';
import WorkflowResultItem from '../WorkflowResultItem';
import { BACKOFFICE_LITERATURE_SEARCH } from '../../../../common/routes';
import { WorkflowStatuses, WorkflowTypes } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';

describe('WorkflowResultItem component for Literature', () => {
  it('calls resolve action from literature buttons', () => {
    const handleResolveAction = jest.fn();
    const handleSelectionChange = jest.fn();
    const item = fromJS({
      id: '456',
      workflow_type: WorkflowTypes.HEP_CREATE,
      status: WorkflowStatuses.APPROVAL,
      decisions: fromJS([
        {
          action: WorkflowDecisions.HEP_ACCEPT_CORE,
        },
      ]),
      data: fromJS({
        titles: fromJS([
          {
            title: 'Example title',
          },
        ]),
        inspire_categories: fromJS([{ term: 'hep-th' }]),
        acquisition_source: fromJS({
          datetime: '2025-01-07T16:29:31.315971',
          email: 'john.doe@cern.ch',
          method: 'submitter1',
          source: 'submitter2',
        }),
      }),
    });

    renderWithProviders(
      <WorkflowResultItem
        item={item}
        handleResolveAction={handleResolveAction}
        shouldShowSelectionCheckbox
        onSelectionChange={handleSelectionChange}
      />,
      {
        route: BACKOFFICE_LITERATURE_SEARCH,
      }
    );

    fireEvent.click(screen.getByRole('button', { name: 'Core' }));

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_ACCEPT_CORE
    );

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select workflow 456' })
    );
    expect(handleSelectionChange).toHaveBeenCalledWith('456', true);
  });

  it('renders publication info, number of pages and public notes conditionally', () => {
    const itemWithDetails = fromJS({
      id: '789',
      workflow_type: WorkflowTypes.HEP_CREATE,
      status: WorkflowStatuses.APPROVAL,
      data: fromJS({
        titles: fromJS([{ title: 'Another title' }]),
        inspire_categories: fromJS([{ term: 'hep-ph' }]),
        publication_info: fromJS([
          {
            journal_title: 'JHEP',
            journal_volume: '10',
            year: 2026,
          },
        ]),
        number_of_pages: 12,
        public_notes: fromJS([
          { value: 'First note' },
          { value: 'Second note' },
        ]),
      }),
    });

    const itemWithoutPublicationDisplay = fromJS({
      id: '790',
      workflow_type: WorkflowTypes.HEP_CREATE,
      status: WorkflowStatuses.APPROVAL,
      data: fromJS({
        titles: fromJS([{ title: 'No publication title' }]),
        inspire_categories: fromJS([{ term: 'hep-ph' }]),
        publication_info: fromJS([{ year: 2026 }]),
      }),
    });

    const { rerender } = renderWithProviders(
      <WorkflowResultItem item={itemWithDetails} />,
      {
        route: BACKOFFICE_LITERATURE_SEARCH,
      }
    );

    expect(screen.getByText('JHEP')).toBeInTheDocument();
    expect(screen.getByText(/Number of Pages/i)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/Public notes/i)).toBeInTheDocument();
    expect(screen.getByText(/First note/i)).toBeInTheDocument();
    expect(screen.getByText(/Second note/i)).toBeInTheDocument();

    rerender(<WorkflowResultItem item={itemWithoutPublicationDisplay} />);

    expect(screen.queryByText('JHEP')).not.toBeInTheDocument();
    expect(screen.queryByText(/Number of Pages/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Public notes/i)).not.toBeInTheDocument();
  });

  it('shows the resolve conflicts button for approval merge workflows', () => {
    const item = fromJS({
      id: 'workflow-1',
      workflow_type: WorkflowTypes.HEP_CREATE,
      status: WorkflowStatuses.APPROVAL_MERGE,
      data: fromJS({
        titles: fromJS([{ title: 'Merge candidate title' }]),
        inspire_categories: fromJS([{ term: 'hep-ph' }]),
      }),
    });

    renderWithProviders(<WorkflowResultItem item={item} />, {
      route: BACKOFFICE_LITERATURE_SEARCH,
    });

    const resolveConflictsButton = screen.getByRole('link', {
      name: /Resolve conflicts/i,
    });

    expect(resolveConflictsButton).toBeInTheDocument();
    expect(resolveConflictsButton).toHaveAttribute(
      'href',
      '/editor/backoffice/literature/workflow-1'
    );
  });

  it('submits rejection reason through modal for submission workflows', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    const item = fromJS({
      id: 'submission-1',
      workflow_type: WorkflowTypes.HEP_SUBMISSION,
      status: WorkflowStatuses.APPROVAL,
      data: {
        titles: [{ title: 'Submission title' }],
        acquisition_source: {
          email: 'submitter@example.org',
          datetime: '2025-01-07T16:29:31.315971',
          source: 'submitter',
        },
      },
    });

    renderWithProviders(
      <WorkflowResultItem
        item={item}
        handleResolveAction={handleResolveAction}
        shouldShowSubmissionModal
        submissionContext={{
          email: 'submitter@example.org',
          title: 'Submission title',
        }}
      />,
      {
        route: BACKOFFICE_LITERATURE_SEARCH,
      }
    );

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    const dialog = screen.getByRole('dialog', { name: 'Reason for rejection' });
    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT,
      expect.stringContaining('submitter@example.org')
    );
    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT,
      expect.stringContaining('Submission title')
    );
  });
});
