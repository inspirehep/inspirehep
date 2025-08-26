import { renderWithRouter } from '../../../../fixtures/render';
import HeaderMenu from '../HeaderMenu';

describe('HeaderMenu', () => {
  it('renders when logged in', () => {
    const { queryByText } = renderWithRouter(
      <HeaderMenu loggedIn onLogoutClick={jest.fn()} />
    );
    expect(queryByText('Login')).not.toBeInTheDocument();
  });

  it('renders when not logged in', () => {
    const { getByText } = renderWithRouter(
      <HeaderMenu loggedIn={false} onLogoutClick={jest.fn()} />
    );
    expect(getByText('Login')).toBeInTheDocument();
  });
});
