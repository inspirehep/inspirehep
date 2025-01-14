import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';
import { getStore } from '../../fixtures/store';
import Data from '..';

describe('Data', () => {
  it('renders initial state', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Data />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /data/:id', async () => {
    const store = getStore({
      data: fromJS({
        data: {
          metadata: {
            control_number: 1234,
            titles: [
              {
                title: 'Detail view',
              },
            ],
          },
        },
      }),
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/data/123']} initialIndex={0}>
          <Data />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    expect(screen.getByTestId('detail-page-container')).toBeInTheDocument();
  });

  it('navigates to SearchPage when /data', async () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/data']} initialIndex={0}>
          <Data />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(screen.getByTestId('search-page-container')).toBeInTheDocument();
  });
});
