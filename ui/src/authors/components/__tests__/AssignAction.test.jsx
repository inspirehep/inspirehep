import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AssignAction from '../AssignAction';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('AssignAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <AssignAction onAssignToAnotherAuthor={jest.fn()} onAssign={jest.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={jest.fn()}
        disabled
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders singular form if numberOfSelected is 1', () => {
    const { asFragment } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={jest.fn()}
        numberOfSelected={1}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders plural form if numberOfSelected is more than 1', () => {
    const { asFragment } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={jest.fn()}
        numberOfSelected={123}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', async () => {
    const user = userEvent.setup();
    const onAssign = jest.fn();
    const { getByRole } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={onAssign}
        onUnassign={jest.fn()}
      />
    );

    const dropdown = getByRole('button', { name: 'file-done claim' });

    await user.hover(dropdown);
    const assignSelfOption = await screen.findByTestId('assign-self');
    await user.click(assignSelfOption);

    await waitFor(() =>
      expect(onAssign).toHaveBeenCalledWith({ from: 123, to: 123 })
    );
  });

  it('calls onAssign on unassign click ', async () => {
    const user = userEvent.setup();
    const onUnassign = jest.fn();

    const { getByRole } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={onUnassign}
      />
    );

    const dropdown = getByRole('button', { name: 'file-done claim' });

    await user.hover(dropdown);
    const unassignOption = await screen.findByTestId('unassign');
    await user.click(unassignOption);

    await waitFor(() => expect(onUnassign).toHaveBeenCalledWith({ from: 123 }));
  });

  it('calls onAssignToAnotherAuthor on assign-another click ', async () => {
    const user = userEvent.setup();
    const onAssign = jest.fn();
    const onAssignToAnotherAuthor = jest.fn();

    const { getByRole } = render(
      <AssignAction
        onAssignToAnotherAuthor={onAssignToAnotherAuthor}
        onAssign={onAssign}
      />
    );

    const dropdown = getByRole('button', { name: 'file-done claim' });

    await user.hover(dropdown);
    const assignAnotherOption = await screen.findByTestId('assign-another');
    await user.click(assignAnotherOption);

    await waitFor(() => expect(onAssign).toHaveBeenCalledTimes(0));
    await waitFor(() => expect(onAssignToAnotherAuthor).toHaveBeenCalled());
  });

  it('displays a tooltip when it is disabled', async () => {
    const user = userEvent.setup();
    render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={jest.fn()}
        disabled
      />
    );

    const claimButton = screen.getByRole('button', { name: /claim/i });

    expect(claimButton).toBeDisabled();
    await user.hover(claimButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Please select the papers you want to claim or remove from the profile.'
        )
      ).toBeInTheDocument();
    });
  });
});
