import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../fixtures/store';
import Literature from '..';

describe('Literature', () => {
  beforeEach(async () => {
    await Loadable.preloadAll();
  });

  it('navigates to SearchPageContainer when /literature', async () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to DetailPageContainer when /literature/:id', async () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature/1787272']} initialIndex={0}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to ReferenceDiffInterfaceContainer when /literature/:id/diff/:old..:new', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });

    const { asFragment } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature/1787272/diff/1..2']}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('does not navigate to ReferenceDiffInterfaceContainer when user is not authorised', async () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    });

    const { asFragment } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature/1787272/diff/1..2']}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});
