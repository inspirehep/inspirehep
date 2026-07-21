import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Journals from '..';
import { JOURNALS } from '../../common/routes';

const renderJournals = (route, initialState) =>
  renderWithProviders(
    <Routes>
      <Route path={`${JOURNALS}/*`} element={<Journals />} />
    </Routes>,
    { initialState, route }
  );

describe('Journals', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Journals />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /journals', () => {
    renderJournals('/journals');

    expect(
      screen.getByTestId('journals-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /journals/:id', () => {
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

    renderJournals('/journals/1', initialState);

    expect(
      screen.getByTestId('journals-detail-page-container')
    ).toBeInTheDocument();
  });
});
