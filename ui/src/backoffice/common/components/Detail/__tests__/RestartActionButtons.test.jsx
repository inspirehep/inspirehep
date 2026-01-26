import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fromJS } from 'immutable';

import { RestartActionButtons } from '../RestartActionButtons';
import { WorkflowActions } from '../../../../constants';

describe('<RestartActionButtons />', () => {
  it('disables the other restart button when one is in progress', () => {
    render(
      <RestartActionButtons
        handleRestart={jest.fn()}
        handleRestartCurrent={jest.fn()}
        id="workflow-1"
        pidType="literature"
        restartActionInProgress={fromJS({
          id: 'workflow-1',
          type: WorkflowActions.RESTART,
          decision: WorkflowActions.RESTART_CURRENT,
        })}
      />
    );

    expect(
      screen.getByRole('button', { name: /Restart workflow/i })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Restart current step/i })
    ).toBeInTheDocument();
  });
});
