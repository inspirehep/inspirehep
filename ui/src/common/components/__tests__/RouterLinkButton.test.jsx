import userEvent from '@testing-library/user-event';
import { renderWithRouter, LocationDisplay } from '../../../fixtures/render';
import RouterLinkButton from '../RouterLinkButton';

describe('RouterLinkButton', () => {
  it('renders a button that navigates to `to` on click', async () => {
    const user = userEvent.setup();
    const { getByRole, getByTestId } = renderWithRouter(
      <>
        <RouterLinkButton to="/test">Test</RouterLinkButton>
        <LocationDisplay />
      </>
    );

    await user.click(getByRole('button', { name: 'Test' }));

    expect(getByTestId('location-display')).toHaveTextContent('/test');
  });
});
