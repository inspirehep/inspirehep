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
        hasInspireCategories
        handleResolveAction={handleResolveAction}
        actionInProgress={null}
        workflowId="workflow-1"
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
});
