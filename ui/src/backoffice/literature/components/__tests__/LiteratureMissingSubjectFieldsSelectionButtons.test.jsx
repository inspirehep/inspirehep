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

  test('renders a weak reject button with tooltip for full coverage', async () => {
    const user = userEvent.setup();
    render(
      <LiteratureMissingSubjectFieldsSelectionButtons
        handleResolveAction={jest.fn()}
        disableActions={false}
        hasInspireCategories={false}
        isFullCoverage
      />
    );

    const rejectButton = screen.getByRole('button', { name: 'Reject' });
    expect(rejectButton).toHaveClass('o-30');

    await user.hover(rejectButton);
    expect(
      await screen.findByText('The article belongs to a fully taken journal')
    ).toBeInTheDocument();
  });

  test('renders a normal reject button when not full coverage', () => {
    render(
      <LiteratureMissingSubjectFieldsSelectionButtons
        handleResolveAction={jest.fn()}
        disableActions={false}
        hasInspireCategories={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Reject' })).toHaveClass(
      'ant-btn-color-dangerous'
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
