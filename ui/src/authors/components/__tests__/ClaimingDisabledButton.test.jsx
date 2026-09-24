import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ClaimingDisabledButton from '../ClaimingDisabledButton';

describe('ClaimingDisabledButton', () => {
  it('is disabled and shows tooltip', async () => {
    const user = userEvent.setup();
    render(<ClaimingDisabledButton />);

    const claimButton = screen.getByRole('button', { name: /claim/i });

    expect(claimButton).toBeDisabled();
    await user.hover(claimButton);

    await waitFor(() => {
      expect(
        screen.getByText('Login to claim your papers')
      ).toBeInTheDocument();
    });
  });
});
