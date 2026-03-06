import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import LiteratureActionButtons from '../LiteratureActionButtons';
import { WorkflowStatuses } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';

describe('<LiteratureActionButtons />', () => {
  test('hides buttons and shows message after action', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureActionButtons
        status={WorkflowStatuses.APPROVAL}
        handleResolveAction={handleResolveAction}
      />
    );

    const acceptButton = screen.getByRole('button', { name: 'Accept' });
    await user.click(acceptButton);

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_ACCEPT
    );
    expect(screen.getByText('Decision submitted.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Accept' })
    ).not.toBeInTheDocument();
  });

  test('shows missing subject fields actions when categories are missing', () => {
    const handleResolveAction = jest.fn();
    render(
      <LiteratureActionButtons
        status={WorkflowStatuses.MISSING_SUBJECT_FIELDS}
        handleResolveAction={handleResolveAction}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Accept' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Core' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  test('shows resolve conflicts editor button for approval merge status', () => {
    render(
      <LiteratureActionButtons
        status={WorkflowStatuses.APPROVAL_MERGE}
        workflowId="workflow-1"
      />
    );

    const resolveConflictsButton = screen.getByRole('link', {
      name: /Resolve conflicts/i,
    });

    expect(resolveConflictsButton).toHaveAttribute(
      'href',
      '/editor/backoffice/literature/workflow-1'
    );
    expect(resolveConflictsButton).toHaveClass('bg-resolve-conflict');
  });
});
