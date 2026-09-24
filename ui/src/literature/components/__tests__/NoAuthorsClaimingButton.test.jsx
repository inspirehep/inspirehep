import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NoAuthorsClaimingButton from '../NoAuthorsClaimingButton';

describe('NoAuthorsClaimingButton', () => {
  it('is disabled and shows tooltip', async () => {
    const user = userEvent.setup();
    render(<NoAuthorsClaimingButton />);

    const claimButton = screen.getByRole('button', { name: /claim/i });

    expect(claimButton).toBeDisabled();
    await user.hover(claimButton);

    await waitFor(() => {
      expect(
        screen.getByText('This paper has no authors.')
      ).toBeInTheDocument();
    });
  });
});
