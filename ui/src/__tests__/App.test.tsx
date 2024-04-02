import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, within } from '@testing-library/react';
import { fromJS, List } from 'immutable';
import Loadable from 'react-loadable';

import {
  getStore,
  getStoreWithState,
  mockActionCreator,
} from '../fixtures/store';
import App from '../App';
import { setUserCategoryFromRoles } from '../tracker';
import { userSignUp, fetchLoggedInUser } from '../actions/user';

jest.mock('../tracker');
jest.mock('../actions/user');
mockActionCreator(userSignUp);
mockActionCreator(fetchLoggedInUser);

describe('App', () => {
  afterEach(() => {
    (setUserCategoryFromRoles as jest.Mock).mockClear();
  });

  it('calls to set user category with roles on render', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    render(
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

  it('dispatches fetchLoggedInUser on render', () => {
    const store = getStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const expectedActions = [
      {
        type: 'fetchLoggedInUser',
        payload: [],
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
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    const app = getByTestId('app');
    const holdingpen = within(app).getByTestId('holdingpen');

    expect(holdingpen).toBeInTheDocument();
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
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    const app = getByTestId('app');
    const holdingpen = within(app).queryByTestId('holdingpen');

    expect(holdingpen).not.toBeInTheDocument();
  });

  it('navigates to new Holdingpen when /holdingpen-new if superuser logged in', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen-new']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    const app = getByTestId('app');
    const holdingpen = within(app).getByTestId('holdingpen-new');

    expect(holdingpen).toBeInTheDocument();
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
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/holdingpen-new']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    const app = getByTestId('app');
    const holdingpen = within(app).queryByTestId('holdingpen-new');

    expect(holdingpen).not.toBeInTheDocument();
  });

  it('navigates to User when /user', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/user']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const user = within(app).getByTestId('user');

    expect(user).toBeInTheDocument();
  });

  it('navigates to Literature when /literature', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const literature = within(app).getByTestId('literature');

    expect(literature).toBeInTheDocument();
  });

  it('navigates to Authors when /authors', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/authors']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const authors = within(app).getByTestId('authors');

    expect(authors).toBeInTheDocument();
  });

  it('navigates to Conferences when /conferences', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/conferences']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const conferences = within(app).getByTestId('conferences');

    expect(conferences).toBeInTheDocument();
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
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/submissions']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    const app = getByTestId('app');
    const submissions = within(app).getByTestId('submissions');

    expect(submissions).toBeInTheDocument();
  });

  it('does not navigate to Submissions when /submissions if not logged in', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/submissions']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    const app = getByTestId('app');
    const submissions = within(app).queryByTestId('submissions');

    expect(submissions).not.toBeInTheDocument();
  });

  it('navigates to Home when /', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const home = within(app).getByTestId('home');

    expect(home).toBeInTheDocument();
  });

  it('navigates to Errors when /errors', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const errors = within(app).getByTestId('errors');

    expect(errors).toBeInTheDocument();
  });

  it('redirects to Errors when /anythingElse', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/anythingElse']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const errors = within(app).getByTestId('errors');

    expect(errors).toBeInTheDocument();
  });

  it('navigates to Jobs when /jobs', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/jobs']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const jobs = within(app).getByTestId('jobs');

    expect(jobs).toBeInTheDocument();
  });

  it('navigates to BibliographyGenerator when /bibliography-generator', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/bibliography-generator']}
          initialIndex={0}
        >
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const bibliography = within(app).getByTestId('bibliography');

    expect(bibliography).toBeInTheDocument();
  });

  it('navigates to Journals when /journals', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/journals']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    const app = getByTestId('app');
    const journals = within(app).getByTestId('journals');

    expect(journals).toBeInTheDocument();
  });
});
