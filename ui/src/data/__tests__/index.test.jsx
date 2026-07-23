import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { renderWithProviders, renderWithRouter } from '../../fixtures/render';
import Data from '..';

describe('Data', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithRouter(<Data />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /data/:id', () => {
    const initialState = {
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
    };
    renderWithProviders(<Data />, {
      initialState,
      route: '/data/123',
    });
    expect(
      screen.getByTestId('data-detail-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to SearchPage when /data', () => {
    renderWithProviders(<Data />, {
      route: '/data',
    });
    expect(
      screen.getByTestId('data-search-page-container')
    ).toBeInTheDocument();
  });
});
