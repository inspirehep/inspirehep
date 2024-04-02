import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import DashboardPageContainer from '../DashboardPageContainer/DashboardPageContainer';

describe('DashboardPageContainer', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new']}>
          <DashboardPageContainer />
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders the DashboardPage component', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new']}>
          <DashboardPageContainer />
        </MemoryRouter>
      </Provider>
    );
    const dashboardPage = getByTestId('holdingpen-dashboard-page');
    expect(dashboardPage).toBeInTheDocument();
  });
});
