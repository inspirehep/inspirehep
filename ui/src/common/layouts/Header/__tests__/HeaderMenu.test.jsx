import { renderWithRouter } from '../../../../fixtures/render';
import HeaderMenu from '../HeaderMenu';

describe('HeaderMenu', () => {
  it('renders when logged in', async () => {
    const { findByText, queryByText } = renderWithRouter(
      <HeaderMenu loggedIn onLogoutClick={jest.fn()} />
    );
    expect(await findByText('Account')).toBeInTheDocument();
    expect(queryByText('Login')).not.toBeInTheDocument();
  });

  it('renders when not logged in', async () => {
    const { findByText } = renderWithRouter(
      <HeaderMenu loggedIn={false} onLogoutClick={jest.fn()} />
    );
    expect(await findByText('Login')).toBeInTheDocument();
  });
});
