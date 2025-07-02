import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { getStore } from '../../fixtures/store';
import Holdingpen from '..';

describe('Holdingpen', () => {
  it('renders initial state', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId('holdingpen')).toBeInTheDocument();
  });

  it('navigates to DashboardPageContainer when /holdingpen/dashboard', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/holdingpen/dashboard']}
          initialIndex={0}
        >
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    // DashboardPageContainer renders "DashboardPage" text
    expect(screen.getByText('DashboardPage')).toBeInTheDocument();
  });

  it('navigates to InspectPageContainer when /holdingpen/inspect/:id', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/holdingpen/inspect/1']}
          initialIndex={0}
        >
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    // InspectPageContainer renders a div with class __InspectPage__
    expect(document.querySelector('.__InspectPage__')).toBeInTheDocument();
  });
});
