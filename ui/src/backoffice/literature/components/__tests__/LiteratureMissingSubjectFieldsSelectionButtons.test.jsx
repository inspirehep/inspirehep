import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { WorkflowDecisions } from '../../../../common/constants';
import { LiteratureMissingSubjectFieldsSelectionButtons } from '../LiteratureMissingSubjectFieldsSelectionButtons';

describe('<LiteratureMissingSubjectFieldsSelectionButtons />', () => {
  test('shows only reject button', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureMissingSubjectFieldsSelectionButtons
        handleResolveAction={handleResolveAction}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Core' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Accept' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.HEP_REJECT
    );
  });
});
