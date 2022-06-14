import React from 'react';
import { mount } from 'enzyme';
import { fromJS, List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import { getStoreWithState } from '../../fixtures/store';
import PrivateRoute from '../PrivateRoute';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PrivateRoute', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('redirects to login if not logged in ', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('routes if logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
              authorizedRoles={List(['authorizeduser'])}
              component={Authorized}
            />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
              authorizedRoles={List(['authorizeduser'])}
              component={Authorized}
            />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
