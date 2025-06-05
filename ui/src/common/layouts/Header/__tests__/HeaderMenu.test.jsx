import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HeaderMenu from '../HeaderMenu';

describe('HeaderMenu', () => {
  it('renders when logged in', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <HeaderMenu loggedIn onLogoutClick={jest.fn()} />
      </MemoryRouter>
    );
    expect(queryByText('Login')).not.toBeInTheDocument();
  });

  it('renders when not logged in', () => {
    const { getByText } = render(
      <MemoryRouter>
        <HeaderMenu loggedIn={false} onLogoutClick={jest.fn()} />
      </MemoryRouter>
    );
    expect(getByText('Login')).toBeInTheDocument();
  });
});
