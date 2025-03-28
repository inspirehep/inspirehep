import { fromJS, List } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import { render } from '@testing-library/react';
import { getStore } from '../../fixtures/store';
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
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/private']} initialIndex={0}>
          <Switch>
            <Route exact path="/user/login" component={UserLogin} />
            <PrivateRoute exact path="/private" component={Private} />
          </Switch>
        </MemoryRouter>
      </Provider>
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
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/private']} initialIndex={0}>
          <Switch>
            <PrivateRoute exact path="/private" component={Private} />
          </Switch>
        </MemoryRouter>
      </Provider>
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
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authorized']} initialIndex={0}>
          <Switch>
            <Route exact path="/errors/401" component={Error401} />
            <PrivateRoute
              exact
              path="/authorized"
              authorizedRoles={List(['authorizeduser'])}
              component={Authorized}
            />
          </Switch>
        </MemoryRouter>
      </Provider>
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
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authorized']} initialIndex={0}>
          <Switch>
            <PrivateRoute
              exact
              path="/authorized"
              authorizedRoles={List(['authorizeduser'])}
              component={Authorized}
            />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Authorized Page')).toBeInTheDocument();
  });
});
