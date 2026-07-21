import { fromJS, List } from 'immutable';
import { Route, Routes } from 'react-router-dom';
import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import RequireAuth from '../RequireAuth';

describe('RequireAuth', () => {
  it('redirects to login if not logged in ', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const Private = () => <div>Private Page</div>;
    const UserLogin = () => <div>User Login Page</div>;
    const { getByText } = renderWithProviders(
      <Routes>
        <Route path="/user/login" element={<UserLogin />} />
        <Route
          path="/private"
          element={
            <RequireAuth>
              <Private />
            </RequireAuth>
          }
        />
      </Routes>,
      {
        route: '/private',
        store,
      }
    );
    expect(getByText('User Login Page')).toBeInTheDocument();
  });

  it('renders loading while the logged-in user is still being fetched', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: false,
        isFetchingLoggedInUser: true,
        data: {
          roles: [],
        },
      }),
    });
    const Private = () => <div>Private Page</div>;
    const UserLogin = () => <div>User Login Page</div>;
    const { getByTestId, queryByText } = renderWithProviders(
      <Routes>
        <Route path="/user/login" element={<UserLogin />} />
        <Route
          path="/private"
          element={
            <RequireAuth>
              <Private />
            </RequireAuth>
          }
        />
      </Routes>,
      {
        route: '/private',
        store,
      }
    );
    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByText('User Login Page')).not.toBeInTheDocument();
    expect(queryByText('Private Page')).not.toBeInTheDocument();
  });

  it('routes if logged in', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    });
    const Private = () => <div>Private Page</div>;
    const { getByText } = renderWithProviders(
      <Routes>
        <Route
          path="/private"
          element={
            <RequireAuth>
              <Private />
            </RequireAuth>
          }
        />
      </Routes>,
      {
        route: '/private',
        store,
      }
    );
    expect(getByText('Private Page')).toBeInTheDocument();
  });

  it('redirects 401 if logged in but not authorized', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['unauthorizeduser'],
        },
      }),
    });
    const Authorized = () => <div>Authorized Page</div>;
    const Error401 = () => <div>Error 401 Page</div>;
    const { getByText } = renderWithProviders(
      <Routes>
        <Route path="/errors/401" element={<Error401 />} />
        <Route
          path="/authorized"
          element={
            <RequireAuth authorizedRoles={List(['authorizeduser'])}>
              <Authorized />
            </RequireAuth>
          }
        />
      </Routes>,
      {
        route: '/authorized',
        store,
      }
    );
    expect(getByText('Error 401 Page')).toBeInTheDocument();
  });

  it('routes if logged in user is authorized', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['authorizeduser'],
        },
      }),
    });
    const Authorized = () => <div>Authorized Page</div>;
    const { getByText } = renderWithProviders(
      <Routes>
        <Route
          path="/authorized"
          element={
            <RequireAuth authorizedRoles={List(['authorizeduser'])}>
              <Authorized />
            </RequireAuth>
          }
        />
      </Routes>,
      {
        route: '/authorized',
        store,
      }
    );
    expect(getByText('Authorized Page')).toBeInTheDocument();
  });
});
