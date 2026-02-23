import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { LiteratureHepSelectionButtons } from '../LiteratureHepSelectionButtons';
import { WorkflowDecisions } from '../../../../common/constants';

describe('<LiteratureHepSelectionButtons />', () => {
  test('shows core, accept, and reject buttons for approval', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureHepSelectionButtons
        handleResolveAction={handleResolveAction}
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

    expect(handleResolveAction).toHaveBeenNthCalledWith(
      1,
      WorkflowDecisions.HEP_ACCEPT_CORE
    );
    expect(handleResolveAction).toHaveBeenNthCalledWith(
      2,
      WorkflowDecisions.HEP_ACCEPT
    );
    expect(handleResolveAction).toHaveBeenNthCalledWith(
      3,
      WorkflowDecisions.HEP_REJECT
    );
  });
});
