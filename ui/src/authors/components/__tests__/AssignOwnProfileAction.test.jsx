import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AssignOwnProfileAction from '../AssignOwnProfileAction';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('AssignOwnProfileAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction onAssign={jest.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders singular form if numberOfSelected is 1', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction onAssign={jest.fn()} numberOfSelected={1} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders plural form if numberOfSelected is more than 1', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction onAssign={jest.fn()} numberOfSelected={123} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabled
        disabledAssignAction
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with disabled assign action', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabledAssignAction
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', async () => {
    const user = userEvent.setup();
    const onAssign = jest.fn();
    const { getByRole } = render(
      <AssignOwnProfileAction onAssign={onAssign} isUnassignAction={false} />
    );

    const dropdown = getByRole('button', { name: 'file-done claim' });

    await user.hover(dropdown);
    const assignSelfOption = await screen.findByTestId('assign-self');
    await user.click(assignSelfOption);

    await waitFor(() =>
      expect(onAssign).toHaveBeenCalledWith({ from: 123, to: 123 })
    );
  });

  it('calls onUnssign on unassign click ', async () => {
    const user = userEvent.setup();
    const onUnassign = jest.fn();
    const onAssign = jest.fn();

    const { getByRole } = render(
      <AssignOwnProfileAction
        onAssign={onAssign}
        onUnassign={onUnassign}
        isUnassignAction
      />
    );

    const dropdown = getByRole('button', { name: 'file-done claim' });

    await user.hover(dropdown);
    const unassignOption = await screen.findByTestId('unassign');
    await user.click(unassignOption);

    await waitFor(() => expect(onUnassign).toHaveBeenCalledWith({ from: 123 }));
  });

  it('displays a tooltip when it is disabled', async () => {
    const user = userEvent.setup();
    render(<AssignOwnProfileAction onAssign={jest.fn()} disabled />);

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
