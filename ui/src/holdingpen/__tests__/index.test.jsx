import { screen } from '@testing-library/react';

import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Holdingpen from '..';
import { HOLDINGPEN } from '../../common/routes';

const renderHoldingpen = (route) =>
  renderWithProviders(
    <Routes>
      <Route path={`${HOLDINGPEN}/*`} element={<Holdingpen />} />
    </Routes>,
    { route }
  );

describe('Holdingpen', () => {
  it('renders initial state', () => {
    renderHoldingpen('/holdingpen');
    expect(screen.getByTestId('holdingpen')).toBeInTheDocument();
  });

  it('navigates to DashboardPageContainer when /holdingpen/dashboard', () => {
    renderHoldingpen('/holdingpen/dashboard');
    expect(screen.getByText('DashboardPage')).toBeInTheDocument();
  });

  it('navigates to InspectPageContainer when /holdingpen/inspect/:id', () => {
    renderHoldingpen('/holdingpen/inspect/1');
    expect(document.querySelector('.__InspectPage__')).toBeInTheDocument();
  });
});
