import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { fromJS, List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../tracker');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('App', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(user... Remove this comment to see the full error message
    setUserCategoryFromRoles.mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(setUserCategoryFromRoles).toHaveBeenLastCalledWith(
      List(['cataloger'])
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Holdingpen)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Holdingpen)).not.toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to User when /user', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/user']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(User)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to Literature when /literature', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Literature)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to Authors when /authors', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/authors']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Authors)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to Conferences when /conferences', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/conferences']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Conferences)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Submissions)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Submissions)).not.toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to Home when /', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Home)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to Errors when /errors', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Errors)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('redirects to Errors when /anythingElse', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/anythingElse']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Errors)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('navigates to Jobs when /jobs', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/jobs']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Jobs)).toExist();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(BibliographyGeneratorPageContainer)).toExist();
  });
});
