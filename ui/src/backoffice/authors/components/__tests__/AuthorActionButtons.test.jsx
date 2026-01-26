import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fromJS } from 'immutable';

import { AuthorActionButtons } from '../AuthorActionButtons';
import { WorkflowDecisions } from '../../../../common/constants';
import { WorkflowActions } from '../../../constants';

describe('<AuthorActionButtons />', () => {
  test('disables other buttons when one decision is loading', () => {
    render(
      <AuthorActionButtons
        handleResolveAction={jest.fn()}
        actionInProgress={fromJS({
          id: 'workflow-1',
          type: WorkflowActions.RESOLVE,
          decision: WorkflowDecisions.ACCEPT,
        })}
        workflowId="workflow-1"
      />
    );

    const acceptButton = screen.getByText('Accept').closest('button');
    const acceptCurateButton = screen
      .getByText('Accept + Curation')
      .closest('button');
    const rejectButton = screen.getByText('Reject').closest('button');

    expect(acceptButton).toBeEnabled();
    expect(acceptCurateButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });
});
