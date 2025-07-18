import React from 'react';
import { waitFor } from '@testing-library/react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../fixtures/render';
import Literature from '..';

describe('Literature', () => {
  beforeEach(async () => {
    await Loadable.preloadAll();
  });

  it('navigates to SearchPageContainer when /literature', async () => {
    const { asFragment } = renderWithProviders(<Literature />, {
      route: '/literature',
    });

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to DetailPageContainer when /literature/:id', async () => {
    const { asFragment } = renderWithProviders(<Literature />, {
      route: '/literature/1787272',
    });

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to ReferenceDiffInterfaceContainer when /literature/:id/diff/:old..:new', async () => {
    const initialState = {
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    };

    const { asFragment } = renderWithProviders(<Literature />, {
      route: '/literature/1787272/diff/1..2',
      initialState,
    });

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('does not navigate to ReferenceDiffInterfaceContainer when user is not authorised', async () => {
    const initialState = {
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    };

    const { asFragment } = renderWithProviders(<Literature />, {
      route: '/literature/1787272/diff/1..2',
      initialState,
    });

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});
