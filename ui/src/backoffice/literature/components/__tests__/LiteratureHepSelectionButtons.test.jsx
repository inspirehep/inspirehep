import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { LiteratureHepSelectionButtons } from '../LiteratureHepSelectionButtons';

describe('<LiteratureHepSelectionButtons />', () => {
  test('shows core, accept, and reject buttons for approval when categories exist', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureHepSelectionButtons
        hasInspireCategories
        handleResolveAction={handleResolveAction}
        actionInProgress=""
      />
    );

    const coreButton = screen.getByRole('button', { name: 'Core' });
    const acceptButton = screen.getByRole('button', { name: 'Accept' });
    const rejectButton = screen.getByRole('button', { name: 'Reject' });
    expect(
      screen.queryByText('Subject field is required')
    ).not.toBeInTheDocument();

    await user.click(coreButton);
    await user.click(acceptButton);
    await user.click(rejectButton);

    expect(handleResolveAction).toHaveBeenNthCalledWith(1, 'hep_accept_core');
    expect(handleResolveAction).toHaveBeenNthCalledWith(2, 'hep_accept');
    expect(handleResolveAction).toHaveBeenNthCalledWith(3, 'hep_reject');
  });

  test('shows warning and only reject button when categories are missing', () => {
    const handleResolveAction = jest.fn();
    render(
      <LiteratureHepSelectionButtons
        hasInspireCategories={false}
        handleResolveAction={handleResolveAction}
        actionInProgress=""
      />
    );

    expect(screen.getByText('Subject field is required')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Core' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Accept' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });
});
