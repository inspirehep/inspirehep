import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../fixtures/render';
import Holdingpen from '..';

describe('Holdingpen', () => {
  it('renders initial state', () => {
    renderWithProviders(<Holdingpen />, { route: '/holdingpen' });
    expect(screen.getByTestId('holdingpen')).toBeInTheDocument();
  });

  it('navigates to DashboardPageContainer when /holdingpen/dashboard', () => {
    renderWithProviders(<Holdingpen />, { route: '/holdingpen/dashboard' });
    expect(screen.getByText('DashboardPage')).toBeInTheDocument();
  });

  it('navigates to InspectPageContainer when /holdingpen/inspect/:id', () => {
    renderWithProviders(<Holdingpen />, { route: '/holdingpen/inspect/1' });
    expect(document.querySelector('.__InspectPage__')).toBeInTheDocument();
  });
});
