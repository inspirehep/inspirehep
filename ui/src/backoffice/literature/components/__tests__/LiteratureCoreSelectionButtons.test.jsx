import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { LiteratureCoreSelectionButtons } from '../LiteratureCoreSelectionButtons';

describe('<LiteratureCoreSelectionButtons />', () => {
  test('renders core-selection buttons and wires their actions', async () => {
    const handleResolveAction = jest.fn();
    const user = userEvent.setup();
    render(
      <LiteratureCoreSelectionButtons
        handleResolveAction={handleResolveAction}
        actionInProgress=""
      />
    );

    await user.click(screen.getByRole('button', { name: 'Core' }));
    expect(handleResolveAction).toHaveBeenNthCalledWith(
      1,
      'core_selection_accept_core'
    );

    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(handleResolveAction).toHaveBeenNthCalledWith(
      2,
      'core_selection_accept'
    );
  });
});
