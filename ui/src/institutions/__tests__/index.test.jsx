import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { renderWithProviders, renderWithRouter } from '../../fixtures/render';
import Institutions from '..';

describe('Institutions', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithRouter(<Institutions />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /institutions', () => {
    renderWithProviders(<Institutions />, {
      route: '/institutions',
    });
    expect(
      screen.getByTestId('institutions-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /institutions/:id', () => {
    const initialState = {
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
    };
    renderWithProviders(<Institutions />, {
      route: '/institutions/1',
      initialState,
    });

    expect(
      screen.getByTestId('institutions-detail-page-container')
    ).toBeInTheDocument();
  });
});
