import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Institutions from '..';
import { INSTITUTIONS } from '../../common/routes';

const renderInstitutions = (route, initialState) =>
  renderWithProviders(
    <Routes>
      <Route path={`${INSTITUTIONS}/*`} element={<Institutions />} />
    </Routes>,
    { initialState, route }
  );

describe('Institutions', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Institutions />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPage when /institutions', () => {
    renderInstitutions('/institutions');
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
    renderInstitutions('/institutions/1', initialState);

    expect(
      screen.getByTestId('institutions-detail-page-container')
    ).toBeInTheDocument();
  });
});
