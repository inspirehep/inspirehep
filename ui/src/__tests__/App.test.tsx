import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { fromJS, List } from 'immutable';
import Loadable from 'react-loadable';

import { getStore, getStoreWithState } from '../fixtures/store';
import App from '../App';
import Holdingpen from '../holdingpen';
import Home from '../home';
import Literature from '../literature';
import User from '../user';
import Submissions from '../submissions';
import Errors from '../errors';
import Authors from '../authors';
import { setUserCategoryFromRoles } from '../tracker';
import Jobs from '../jobs';
import Conferences from '../conferences';
import { LOGGED_IN_USER_REQUEST } from '../actions/actionTypes';
import BibliographyGeneratorPageContainer from '../bibliographyGenerator/BibliographyGeneratorPageContainer';

jest.mock('../tracker');

describe('App', () => {
  afterEach(() => {
    setUserCategoryFromRoles.mockClear();
  });

  it('calls to set user category with roles on mount', () => {
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
    expect(setUserCategoryFromRoles).toHaveBeenLastCalledWith(
      List(['cataloger'])
    );
  });

  it('dispatches LOGGED_IN_USER_REQUEST on mount', () => {
    const store = getStore();
    mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const expectedActions = [
      {
        type: LOGGED_IN_USER_REQUEST,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('navigates to Holdingpen when /holdingpen if logged in', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();
    expect(wrapper.find(Holdingpen)).toExist();
  });

  it('does not navigate to Holdingpen when /holdingpen if not logged in', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();
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

  it('navigates to Conferences when /conferences', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/conferences']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Conferences)).toExist();
  });

  it('navigates to Submissions when /submissions if logged in', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/submissions']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();
    expect(wrapper.find(Submissions)).toExist();
  });

  it('navigates to Submissions when /submissions if not logged in', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/submissions']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();
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
    expect(wrapper.find(Errors)).toExist();
  });

  it('navigates to Jobs when /jobs', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/jobs']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Jobs)).toExist();
  });

  it('navigates to BibliographyGenerator when /bibliography-generator', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/bibliography-generator']}
          initialIndex={0}
        >
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(BibliographyGeneratorPageContainer)).toExist();
  });
});
