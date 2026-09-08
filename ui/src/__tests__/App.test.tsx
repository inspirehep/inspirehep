import { within, screen, waitFor } from '@testing-library/react';
import { fromJS, List } from 'immutable';
import { vi } from 'vitest';

import { getStore, mockActionCreator } from '../fixtures/store';
import { renderWithProviders } from '../fixtures/render';
import App from '../App';
import { setUserCategoryFromRoles } from '../tracker';
import { userSignUp, fetchLoggedInUser } from '../actions/user';
import { BACKOFFICE } from '../common/routes';

vi.mock('../tracker');
vi.mock('../actions/user');
mockActionCreator(userSignUp);
mockActionCreator(fetchLoggedInUser);

describe('App', () => {
  afterEach(() => {
    (setUserCategoryFromRoles as jest.Mock).mockClear();
  });

  it('calls to set user category with roles on render', async () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });

    renderWithProviders(<App />, { store });

    await waitFor(() =>
      expect(setUserCategoryFromRoles).toHaveBeenLastCalledWith(
        List(['cataloger'])
      )
    );
  });

  it('dispatches fetchLoggedInUser on render', async () => {
    const store = getStore();
    renderWithProviders(<App />, { store });
    const expectedActions = [
      {
        type: 'fetchLoggedInUser',
        payload: [],
      },
    ];
    await waitFor(() => expect(store.getActions()).toEqual(expectedActions));
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
    renderWithProviders(<App />, {
      store,
      route: BACKOFFICE,
    });
    const app = await screen.findByTestId('app');
    const backoffice = await within(app).findByTestId('backoffice');

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
    renderWithProviders(<App />, {
      store,
      route: BACKOFFICE,
    });
    const app = await screen.findByTestId('app');
    const backoffice = within(app).queryByTestId('backoffice');

    expect(backoffice).not.toBeInTheDocument();
  });

  it('navigates to User when /user', async () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/user',
    });
    const app = getByTestId('app');
    const user = await within(app).findByTestId('user');

    expect(user).toBeInTheDocument();
  });

  it('navigates to Literature when /literature', async () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/literature',
    });
    const app = getByTestId('app');
    const literature = await within(app).findByTestId('literature');

    expect(literature).toBeInTheDocument();
  });

  it('navigates to Authors when /authors', async () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/authors' });
    const app = getByTestId('app');
    const authors = await within(app).findByTestId('authors');

    expect(authors).toBeInTheDocument();
  });

  it('navigates to Conferences when /conferences', async () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/conferences',
    });
    const app = getByTestId('app');
    const conferences = await within(app).findByTestId('conferences');

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
    renderWithProviders(<App />, {
      store,
      route: '/submissions',
    });
    const app = await screen.findByTestId('app');
    const submissions = await within(app).findByTestId('submissions');

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
    renderWithProviders(<App />, {
      store,
      route: '/submissions',
    });
    const app = await screen.findByTestId('app');
    const submissions = within(app).queryByTestId('submissions');

    expect(submissions).not.toBeInTheDocument();
  });

  it('navigates to Home when /', async () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/' });
    const app = getByTestId('app');
    const home = await within(app).findByTestId('home');

    expect(home).toBeInTheDocument();
  });

  it('navigates to Errors when /errors', async () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/errors' });
    const app = getByTestId('app');
    const errors = await within(app).findByTestId('errors');

    expect(errors).toBeInTheDocument();
  });

  it('redirects to Errors when /anythingElse', async () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/anythingElse',
    });
    const app = getByTestId('app');
    const errors = await within(app).findByTestId('errors');

    expect(errors).toBeInTheDocument();
  });

  it('navigates to Jobs when /jobs', async () => {
    const { getByTestId } = renderWithProviders(<App />, { route: '/jobs' });
    const app = getByTestId('app');
    const jobs = await within(app).findByTestId('jobs');

    expect(jobs).toBeInTheDocument();
  });

  it('navigates to BibliographyGenerator when /bibliography-generator', async () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/bibliography-generator',
    });
    const app = getByTestId('app');
    const bibliography = await within(app).findByTestId('bibliography');

    expect(bibliography).toBeInTheDocument();
  });

  it('navigates to Journals when /journals', async () => {
    const { getByTestId } = renderWithProviders(<App />, {
      route: '/journals',
    });
    const app = getByTestId('app');
    const journals = await within(app).findByTestId('journals');

    expect(journals).toBeInTheDocument();
  });
});
