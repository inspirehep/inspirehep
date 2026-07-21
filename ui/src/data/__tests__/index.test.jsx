import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Data from '..';
import { DATA } from '../../common/routes';

const renderData = (route, initialState) =>
  renderWithProviders(
    <Routes>
      <Route path={`${DATA}/*`} element={<Data />} />
    </Routes>,
    { initialState, route }
  );

describe('Data', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Data />);
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
    renderData('/data/123', initialState);
    expect(
      screen.getByTestId('data-detail-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to SearchPage when /data', () => {
    renderData('/data');
    expect(
      screen.getByTestId('data-search-page-container')
    ).toBeInTheDocument();
  });
});
