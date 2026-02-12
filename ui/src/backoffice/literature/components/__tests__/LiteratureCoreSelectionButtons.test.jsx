import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { LiteratureCoreSelectionButtons } from '../LiteratureCoreSelectionButtons';
import { WorkflowDecisions } from '../../../../common/constants';

describe('<LiteratureCoreSelectionButtons />', () => {
  test('renders core-selection buttons and wires their actions', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureCoreSelectionButtons
        handleResolveAction={handleResolveAction}
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
});
