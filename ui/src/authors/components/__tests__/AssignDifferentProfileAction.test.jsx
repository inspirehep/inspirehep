import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AssignDifferentProfileAction from '../AssignDifferentProfileAction';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('AssignDifferentProfileAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled={false}
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled={false}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled
        claimingClaimedPapersDisabled
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with claimingUnclaimedPapersDisabled', () => {
    const { asFragment } = render(
      <AssignDifferentProfileAction
        onAssign={jest.fn()}
        disabled
        currentUserId={33}
        claimingUnclaimedPapersDisabled={false}
        claimingClaimedPapersDisabled
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', async () => {
    const user = userEvent.setup();
    const onAssign = jest.fn();
    const { getByRole } = render(
      <AssignDifferentProfileAction
        onAssign={onAssign}
        currentUserId={33}
        disabled={false}
      />
    );

    const dropdown = getByRole('button', { name: 'file-done claim' });

    await user.hover(dropdown);
    const assignSelfOption = await screen.findByTestId('assign-self');
    await user.click(assignSelfOption);

    await waitFor(() => expect(onAssign).toHaveBeenCalled());
  });

  it('displays a tooltip when it is disabled', async () => {
    const user = userEvent.setup();
    render(<AssignDifferentProfileAction onAssign={jest.fn()} disabled />);

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
