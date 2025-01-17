import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';
import { getStore } from '../../fixtures/store';
import Institutions from '..';

describe('Institutions', () => {
  it('renders initial state', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Institutions />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /institutions', async () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/institutions']} initialIndex={0}>
          <Institutions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    expect(
      screen.getByTestId('institutions-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /institutions/:id', async () => {
    const store = getStore({
      institutions: fromJS({
        data: {
          metadata: {
            legacy_ICN: 'institution',
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
        <MemoryRouter initialEntries={['/institutions/1']} initialIndex={0}>
          <Institutions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('institutions-detail-page-container')
    ).toBeInTheDocument();
  });
});
