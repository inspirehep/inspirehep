import { fromJS, List } from 'immutable';
import { Route, Switch } from 'react-router-dom';

import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import PrivateRoute from '../PrivateRoute';

describe('PrivateRoute', () => {
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
      <Switch>
        <Route exact path="/user/login" component={UserLogin} />
        <PrivateRoute exact path="/private" component={Private} />
      </Switch>,
      {
        route: '/private',
        store,
      }
    );
    expect(getByText('User Login Page')).toBeInTheDocument();
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
      <Switch>
        <PrivateRoute exact path="/private" component={Private} />
      </Switch>,
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
      <Switch>
        <Route exact path="/errors/401" component={Error401} />
        <PrivateRoute
          exact
          path="/authorized"
          authorizedRoles={List(['authorizeduser'])}
          component={Authorized}
        />
      </Switch>,
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
      <Switch>
        <PrivateRoute
          exact
          path="/authorized"
          authorizedRoles={List(['authorizeduser'])}
          component={Authorized}
        />
      </Switch>,
      {
        route: '/authorized',
        store,
      }
    );
    expect(getByText('Authorized Page')).toBeInTheDocument();
  });
});
