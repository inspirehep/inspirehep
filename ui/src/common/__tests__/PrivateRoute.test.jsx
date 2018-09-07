import React from 'react';
import { mount } from 'enzyme';
import { fromJS, Set } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import { getStoreWithState } from '../../fixtures/store';
import PrivateRoute from '../PrivateRoute';

describe('PrivateRoute', () => {
  it('redirects to login if not logged in ', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
      }),
    });
    const Private = () => <div>Private Page</div>;
    const UserLogin = () => <div>User Login Page</div>;
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/private']} initialIndex={0}>
          <Switch>
            <Route exact path="/user/login" component={UserLogin} />
            <PrivateRoute exact path="/private" component={Private} />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('routes if logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
      }),
    });
    const Private = () => <div>Private Page</div>;
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/private']} initialIndex={0}>
          <Switch>
            <PrivateRoute exact path="/private" component={Private} />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('redirects 401 if logged in but not authorized', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['unauthorizeduser'],
        },
      }),
    });
    const Authorized = () => <div>Authorized Page</div>;
    const Error401 = () => <div>Error 401 Page</div>;
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authorized']} initialIndex={0}>
          <Switch>
            <Route exact path="/errors/401" component={Error401} />
            <PrivateRoute
              exact
              path="/authorized"
              authorizedRoles={Set(['authorizeduser'])}
              component={Authorized}
            />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('routes if logged in user is authorized', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['authorizeduser'],
        },
      }),
    });
    const Authorized = () => <div>Authorized Page</div>;
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authorized']} initialIndex={0}>
          <Switch>
            <PrivateRoute
              exact
              path="/authorized"
              authorizedRoles={Set(['authorizeduser'])}
              component={Authorized}
            />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
