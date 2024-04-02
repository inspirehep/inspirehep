import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { render } from '@testing-library/react';

import { getStore } from '../../fixtures/store';
import Holdingpen from '..';
import DashboardPageContainer from '../containers/DashboardPageContainer/DashboardPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer/DetailPageContainer';

describe('Holdingpen', () => {
  it('renders initial state', () => {
    const { container } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new/dashboard']}>
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /holdingpen-new/dashboard', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new/dashboard']}>
          <Route
            path="/holdingpen-new/dashboard"
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
        <MemoryRouter initialEntries={['/holdingpen-new/1']}>
          <Route path="/holdingpen-new/:id" component={DetailPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-detail-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /holdingpen-new/search', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new/search']}>
          <Route
            path="/holdingpen-new/search"
            component={SearchPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-search-page')).toBeInTheDocument();
  });
});
