import { fromJS } from 'immutable';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import { getStore } from '../../fixtures/store';
import Seminars from '..';
import { SEMINARS } from '../../common/routes';

const renderSeminars = (route, store) =>
  renderWithProviders(
    <Routes>
      <Route path={`${SEMINARS}/*`} element={<Seminars />} />
    </Routes>,
    { store, route }
  );

describe('Seminars', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Seminars />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /seminars', () => {
    renderSeminars('/seminars');

    expect(
      screen.getByTestId('seminars-search-page-container')
    ).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /seminars/:id', () => {
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
    renderSeminars('/seminars/123', store);

    expect(
      screen.getByTestId('seminars-detail-page-container')
    ).toBeInTheDocument();
  });
});
