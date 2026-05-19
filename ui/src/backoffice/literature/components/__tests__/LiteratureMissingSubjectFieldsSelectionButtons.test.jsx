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
        disableActions={false}
        hasInspireCategories={false}
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

  it.each([
    ['Core', WorkflowDecisions.HEP_ACCEPT_CORE],
    ['Accept', WorkflowDecisions.HEP_ACCEPT],
  ])(
    'shows %s when inspire categories has been filled',
    async (buttonName, decision) => {
      const handleResolveAction = jest.fn();
      const user = userEvent.setup();
      render(
        <LiteratureMissingSubjectFieldsSelectionButtons
          handleResolveAction={handleResolveAction}
          disableActions={false}
          hasInspireCategories
        />
      );

      expect(
        screen.getByRole('button', { name: 'Reject' })
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: buttonName }));
      expect(handleResolveAction).toHaveBeenCalledWith(decision);
    }
  );
});
