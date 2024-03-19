import React from 'react';
import { render } from '@testing-library/react';

import DashboardPageContainer from '../DashboardPageContainer/DashboardPageContainer';

describe('DashboardPageContainer', () => {
  it('renders without crashing', () => {
    render(<DashboardPageContainer />);
  });

  it('renders the DashboardPage component', () => {
    const { getByTestId } = render(<DashboardPageContainer />);
    const dashboardPage = getByTestId('holdingpen-dashboard-page');
    expect(dashboardPage).toBeInTheDocument();
  });
});
