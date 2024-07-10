import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { getStore, getStoreWithState } from '../../fixtures/store';
import Holdingpen from '..';
import DashboardPageContainer from '../containers/DashboardPageContainer/DashboardPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer/DetailPageContainer';
import {
  HOLDINGPEN_DASHBOARD_NEW,
  HOLDINGPEN_SEARCH_NEW,
} from '../../common/routes';

describe('Holdingpen', () => {
  const store = getStoreWithState({
    user: fromJS({
      loggedIn: true,
      data: {
        roles: ['cataloger'],
      },
    }),
  });

  it('renders initial state', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[HOLDINGPEN_DASHBOARD_NEW]}>
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /holdingpen-new/dashboard', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[HOLDINGPEN_DASHBOARD_NEW]}>
          <Route
            path={HOLDINGPEN_DASHBOARD_NEW}
            component={DashboardPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-dashboard-page')).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /holdingpen-new/:id', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[`${HOLDINGPEN_DASHBOARD_NEW}/:id`]}>
          <Route
            path={`${HOLDINGPEN_DASHBOARD_NEW}/:id`}
            component={DetailPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-detail-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /holdingpen-new/search', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[HOLDINGPEN_SEARCH_NEW]}>
          <Route path={HOLDINGPEN_SEARCH_NEW} component={SearchPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-search-page')).toBeInTheDocument();
  });
});
