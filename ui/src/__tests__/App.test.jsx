import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Redirect } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import { fromJS, Set } from 'immutable';

import { getStore, getStoreWithState } from '../fixtures/store';
import App from '../App';
import Holdingpen from '../holdingpen';
import Home from '../home';
import Literature from '../literature';
import User from '../user';
import Submissions from '../submissions';
import Errors from '../errors';
import Authors from '../authors';
import { ERRORS } from '../common/routes';
import * as tracker from '../tracker';

jest.mock('../tracker');

describe('App', () => {
  it('renders initial state', () => {
    const wrapper = shallow(<App store={getStore()} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls to set user category with roles on mount', () => {
    tracker.setUserCategoryFromRoles = jest.fn();
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(tracker.setUserCategoryFromRoles).toHaveBeenLastCalledWith(
      Set(['cataloger'])
    );
  });

  it('navigates to Holdingpen when /holdingpen if logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Holdingpen)).toExist();
  });

  it('does not navigate to Holdingpen when /holdingpen if not logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Holdingpen)).not.toExist();
  });

  it('navigates to User when /user', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/user']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(User)).toExist();
  });

  it('navigates to Literature when /literature', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Literature)).toExist();
  });

  it('navigates to Authors when /authors', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/authors']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Authors)).toExist();
  });

  it('navigates to Submissions when /submissions if logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/submissions']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Submissions)).toExist();
  });

  it('navigates to Submissions when /submissions if not logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/submissions']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Submissions)).not.toExist();
  });

  it('navigates to Home when /', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Home)).toExist();
  });

  it('navigates to Errors when /errors', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Errors)).toExist();
  });

  it('redirects to Errors when /anythingElse', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/anythingElse']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Redirect)).toHaveProp('to', ERRORS);
  });
});
