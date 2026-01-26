import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { fromJS } from 'immutable';
import { LiteratureCoreSelectionButtons } from '../LiteratureCoreSelectionButtons';
import { WorkflowDecisions } from '../../../../common/constants';
import { WorkflowActions } from '../../../constants';

describe('<LiteratureCoreSelectionButtons />', () => {
  test('renders core-selection buttons and wires their actions', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureCoreSelectionButtons
        handleResolveAction={handleResolveAction}
        actionInProgress={null}
        workflowId="workflow-1"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Core' }));
    expect(handleResolveAction).toHaveBeenNthCalledWith(
      1,
      WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE
    );

    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(handleResolveAction).toHaveBeenNthCalledWith(
      2,
      WorkflowDecisions.CORE_SELECTION_ACCEPT
    );
  });

  test('disables the other button when one action is loading', () => {
    render(
      <LiteratureCoreSelectionButtons
        handleResolveAction={jest.fn()}
        actionInProgress={fromJS({
          id: 'workflow-1',
          type: WorkflowActions.RESOLVE,
          decision: WorkflowDecisions.CORE_SELECTION_ACCEPT,
        })}
        workflowId="workflow-1"
      />
    );

    expect(screen.getByRole('button', { name: /Accept/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Core' })).toBeDisabled();
  });
});
