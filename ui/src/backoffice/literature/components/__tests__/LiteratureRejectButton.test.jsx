import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test('shows weak reject styling for full journal coverage', () => {
    render(<LiteratureRejectButton handleResolveAction={jest.fn()} isWeak />);

    const rejectButton = screen.getByRole('button', { name: 'Reject' });
    expect(rejectButton).toHaveClass('bg-error-weak');
  });
});
