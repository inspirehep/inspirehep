import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Seminars from '..';

describe('Seminars', () => {
  it('renders initial state', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Seminars />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /seminars', async () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/seminars']} initialIndex={0}>
          <Seminars />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('seminars-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /seminars/:id', async () => {
    const store = getStore({
      seminars: fromJS({
        data: {
          metadata: {
            legacy_ICN: 'seminars',
            control_number: 1234,
            title: { title: 'test' },
            timezone: 'Europe/Zurich',
            speakers: [{ first_name: 'Harun', last_name: 'Urhan' }],
            start_datetime: '2020-05-15T11:34:00.000000',
            end_datetime: '2020-05-15T17:34:00.000000',
          },
        },
      }),
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/seminars/123']} initialIndex={0}>
          <Seminars />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('seminars-detail-page-container')
    ).toBeInTheDocument();
  });
});
