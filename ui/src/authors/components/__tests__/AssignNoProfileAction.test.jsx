import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AssignNoProfileAction from '../AssignNoProfileAction';

describe('AssignNoProfileAction', () => {
  it('is disabled and shows tooltip', async () => {
    const user = userEvent.setup();
    render(<AssignNoProfileAction />);

    const claimButton = screen.getByRole('button', { name: /claim/i });

    expect(claimButton).toBeDisabled();
    await user.hover(claimButton);

    await waitFor(() => {
      expect(
        screen.getByText(/There is no profile associated to your account/)
      ).toBeInTheDocument();
    });
  });
});
