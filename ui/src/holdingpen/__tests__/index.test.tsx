import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { render } from '@testing-library/react';

import { getStore } from '../../fixtures/store';
import Holdingpen from '..';
import DashboardPageContainer from '../containers/DashboardPageContainer/DashboardPageContainer';
import InspectPageContainer from '../containers/InspectPageContainer/InspectPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer/DetailPageContainer';

describe('Holdingpen', () => {
  it('renders initial state', () => {
    const { container } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen/dashboard']}>
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /holdingpen/dashboard', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen/dashboard']}>
          <Route
            path="/holdingpen/dashboard"
            component={DashboardPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-dashboard-page')).toBeInTheDocument();
  });

  it('navigates to InspectPageContainer when /holdingpen/inspect/:id', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/holdingpen/inspect/1']}
          initialIndex={0}
        >
          <Route
            path="/holdingpen/inspect/1"
            component={InspectPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(getByTestId('holdingpen-inspect-page')).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /holdingpen/:id', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen/1']}>
          <Route path="/holdingpen/:id" component={DetailPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-detail-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /holdingpen/search', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen/search']}>
          <Route path="/holdingpen/search" component={SearchPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('holdingpen-search-page')).toBeInTheDocument();
  });
});
