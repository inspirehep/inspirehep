import React from 'react';
import { within } from '@testing-library/react';
import { fromJS, List } from 'immutable';
import Loadable from 'react-loadable';

import { getStore, mockActionCreator } from '../fixtures/store';
import { renderWithProviders } from '../fixtures/render';
import App from '../App';
import { setUserCategoryFromRoles } from '../tracker';
import { userSignUp, fetchLoggedInUser } from '../actions/user';
import { BACKOFFICE } from '../common/routes';

jest.mock('../tracker');
jest.mock('../actions/user');
mockActionCreator(userSignUp);
mockActionCreator(fetchLoggedInUser);

describe('App', () => {
  afterEach(() => {
    (setUserCategoryFromRoles as jest.Mock).mockClear();
  });

  it('calls to set user category with roles on render', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });

    renderWithProviders(<App />, { store });

    expect(setUserCategoryFromRoles).toHaveBeenLastCalledWith(
      List(['cataloger'])
    );
  });

  it('dispatches fetchLoggedInUser on render', () => {
    const store = getStore();
    renderWithProviders(<App />, { store });
    const expectedActions = [
      {
        type: 'fetchLoggedInUser',
        payload: [],
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('navigates to Holdingpen when /holdingpen if logged in', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<App />, {
      store,
      route: '/holdingpen',
    });
    await Loadable.preloadAll();

    const app = getByTestId('app');
    const holdingpen = within(app).getByTestId('holdingpen');

    expect(holdingpen).toBeInTheDocument();
  });

  it('does not navigate to Holdingpen when /holdingpen if not logged in', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<App />, {
      store,
      route: '/holdingpen',
    });
    await Loadable.preloadAll();
    const app = getByTestId('app');
    const holdingpen = within(app).queryByTestId('holdingpen');

    expect(holdingpen).not.toBeInTheDocument();
  });

  it('navigates to Backoffice when /backoffice if superuser logged in', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<App />, {
      store,
      route: BACKOFFICE,
    });
    await Loadable.preloadAll();

    const app = getByTestId('app');
    const backoffice = within(app).getByTestId('backoffice');

    expect(backoffice).toBeInTheDocument();
  });

  it('does not navigate to backoffice when /backoffice if not logged in', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<App />, {
      store,
      route: BACKOFFICE,
    });
    await Loadable.preloadAll();
    const app = getByTestId('app');
    const backoffice = within(app).queryByTestId('backoffice');

    expect(backoffice).not.toBeInTheDocument();
  });

  it('navigates to User when /user', () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/user' });
    const app = getByTestId('app');
    const user = within(app).getByTestId('user');

    expect(user).toBeInTheDocument();
  });

  it('navigates to Literature when /literature', () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/literature',
    });
    const app = getByTestId('app');
    const literature = within(app).getByTestId('literature');

    expect(literature).toBeInTheDocument();
  });

  it('navigates to Authors when /authors', () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/authors' });
    const app = getByTestId('app');
    const authors = within(app).getByTestId('authors');

    expect(authors).toBeInTheDocument();
  });

  it('navigates to Conferences when /conferences', () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/conferences',
    });
    const app = getByTestId('app');
    const conferences = within(app).getByTestId('conferences');

    expect(conferences).toBeInTheDocument();
  });

  it('navigates to Submissions when /submissions if logged in', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<App />, {
      store,
      route: '/submissions',
    });
    await Loadable.preloadAll();
    const app = getByTestId('app');
    const submissions = within(app).getByTestId('submissions');

    expect(submissions).toBeInTheDocument();
  });

  it('does not navigate to Submissions when /submissions if not logged in', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: false,
        data: {
          roles: [],
        },
      }),
    });
    const { getByTestId } = renderWithProviders(<App />, {
      store,
      route: '/submissions',
    });
    await Loadable.preloadAll();

    const app = getByTestId('app');
    const submissions = within(app).queryByTestId('submissions');

    expect(submissions).not.toBeInTheDocument();
  });

  it('navigates to Home when /', () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/' });
    const app = getByTestId('app');
    const home = within(app).getByTestId('home');

    expect(home).toBeInTheDocument();
  });

  it('navigates to Errors when /errors', () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/errors' });
    const app = getByTestId('app');
    const errors = within(app).getByTestId('errors');

    expect(errors).toBeInTheDocument();
  });

  it('redirects to Errors when /anythingElse', () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/anythingElse',
    });
    const app = getByTestId('app');
    const errors = within(app).getByTestId('errors');

    expect(errors).toBeInTheDocument();
  });

  it('navigates to Jobs when /jobs', () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/jobs' });
    const app = getByTestId('app');
    const jobs = within(app).getByTestId('jobs');

    expect(jobs).toBeInTheDocument();
  });

  it('navigates to BibliographyGenerator when /bibliography-generator', () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/bibliography-generator',
    });
    const app = getByTestId('app');
    const bibliography = within(app).getByTestId('bibliography');

    expect(bibliography).toBeInTheDocument();
  });

  it('navigates to Journals when /journals', () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/journals',
    });
    const app = getByTestId('app');
    const journals = within(app).getByTestId('journals');

    expect(journals).toBeInTheDocument();
  });
});
