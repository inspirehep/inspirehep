import React from 'react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';

import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import Authors from '..';

describe('Authors', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Authors />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPageContainer when /authors', async () => {
    const { getByTestId } = renderWithProviders(<Authors />, {
      route: '/authors',
    });
    await Loadable.preloadAll();
    expect(getByTestId('authors-search-page-container')).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /authors/:id', async () => {
    const store = getStore({
      authors: fromJS({
        data: {
          metadata: {
            control_number: 1234,
            titles: [
              {
                title: 'Detail view',
              },
            ],
            ids: [],
            name: {
              preferred_name: 'Author Name',
            },
          },
        },
        publicationSelection: [],
      }),
    });

    const { getByTestId } = renderWithProviders(<Authors />, {
      store,
      route: '/authors/1',
    });
    await Loadable.preloadAll();

    expect(getByTestId('authors-detail-page-container')).toBeInTheDocument();
  });
});
