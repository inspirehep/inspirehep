import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import LiteratureRejectButton from '../LiteratureRejectButton';
import { WorkflowDecisions } from '../../../../common/constants';

describe('<LiteratureRejectButton />', () => {
  test('rejects directly for hep workflows', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();

    render(
      <LiteratureRejectButton handleResolveAction={handleResolveAction} />
    );

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT
    );
  });

  test('opens modal and submits template reason for submission workflows', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();

    render(
      <LiteratureRejectButton
        handleResolveAction={handleResolveAction}
        shouldShowSubmissionModal
        submissionContext={{
          email: 'submitter@example.org',
          title: 'Suggested title',
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(screen.getByText('Reason for rejection')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog', { name: 'Reason for rejection' });

    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT,
      expect.stringContaining('submitter@example.org')
    );
    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT,
      expect.stringContaining('Suggested title')
    );
  });

  test('rejects directly for submission workflows outside approval status', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();

    render(
      <LiteratureRejectButton
        handleResolveAction={handleResolveAction}
        submissionContext={{
          email: 'submitter@example.org',
          title: 'Suggested title',
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT
    );
    expect(screen.queryByText('Reason for rejection')).not.toBeInTheDocument();
  });

  test('shows weak reject styling for full journal coverage', () => {
    render(<LiteratureRejectButton handleResolveAction={jest.fn()} isWeak />);

    const rejectButton = screen.getByRole('button', { name: 'Reject' });
    expect(rejectButton).toHaveClass('bg-error-weak');
  });
});
