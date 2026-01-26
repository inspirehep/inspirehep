import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { fromJS } from 'immutable';
import { LiteratureHepSelectionButtons } from '../LiteratureHepSelectionButtons';
import { WorkflowDecisions } from '../../../../common/constants';
import { WorkflowActions } from '../../../constants';

describe('<LiteratureHepSelectionButtons />', () => {
  test('shows core, accept, and reject buttons for approval when categories exist', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureHepSelectionButtons
        hasInspireCategories
        handleResolveAction={handleResolveAction}
        actionInProgress={null}
        workflowId="workflow-1"
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

  test('shows warning and only reject button when categories are missing', () => {
    const handleResolveAction = jest.fn();
    render(
      <LiteratureHepSelectionButtons
        hasInspireCategories={false}
        handleResolveAction={handleResolveAction}
        actionInProgress={null}
        workflowId="workflow-1"
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

  test('disables other buttons when one decision is loading', () => {
    render(
      <LiteratureHepSelectionButtons
        hasInspireCategories
        handleResolveAction={jest.fn()}
        actionInProgress={fromJS({
          id: 'workflow-1',
          type: WorkflowActions.RESOLVE,
          decision: WorkflowDecisions.HEP_ACCEPT,
        })}
        workflowId="workflow-1"
      />
    );

    expect(screen.getByRole('button', { name: /Accept/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Core' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  });
});
