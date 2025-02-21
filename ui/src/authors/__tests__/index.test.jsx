import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';

import { getStore } from '../../fixtures/store';
import Authors from '..';

describe('Authors', () => {
  it('renders initial state', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Authors />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPageContainer when /authors', async () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/authors']} initialIndex={0}>
          <Authors />
        </MemoryRouter>
      </Provider>
    );
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

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/1']} initialIndex={0}>
          <Authors />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(getByTestId('authors-detail-page-container')).toBeInTheDocument();
  });
});
