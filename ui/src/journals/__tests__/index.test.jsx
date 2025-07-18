import React from 'react';
import Loadable from 'react-loadable';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import { renderWithProviders, renderWithRouter } from '../../fixtures/render';
import Journals from '..';

describe('Journals', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithRouter(<Journals />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /journals', async () => {
    renderWithProviders(<Journals />, {
      route: '/journals',
    });
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('journals-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /journals/:id', async () => {
    const initialState = {
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
    };

    renderWithProviders(<Journals />, {
      route: '/journals/1',
      initialState,
    });
    await Loadable.preloadAll();

    expect(
      screen.getByTestId('journals-detail-page-container')
    ).toBeInTheDocument();
  });
});
