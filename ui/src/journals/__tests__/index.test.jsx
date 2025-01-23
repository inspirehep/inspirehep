import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Loadable from 'react-loadable';

import { render, screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { getStore } from '../../fixtures/store';
import Journals from '..';

describe('Journals', () => {
  it('renders initial state', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Journals />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /journals', async () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/journals']} initialIndex={0}>
          <Journals />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('journals-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /journals/:id', async () => {
    const store = getStore({
      journals: fromJS({
        data: {
          metadata: {
            short_title: 'Calc.Var.Part.Differ.Equ',
            journal_title: {
              title:
                'Calculus of Variations and Partial Differential Equations',
            },
            control_number: 1213100,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/journals/1']} initialIndex={0}>
          <Journals />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('journals-detail-page-container')
    ).toBeInTheDocument();
  });
});
