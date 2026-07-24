import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Conferences from '..';
import { CONFERENCES } from '../../common/routes';

vi.mock('../containers/DetailPageContainer', () => ({
  default: () => <div data-testid="detail-page-container">Detail Page</div>,
}));

vi.mock('../containers/SearchPageContainer', () => ({
  default: () => <div data-testid="search-page-container">Search Page</div>,
}));

const renderConferences = (route) =>
  renderWithProviders(
    <Routes>
      <Route path={`${CONFERENCES}/*`} element={<Conferences />} />
    </Routes>,
    { route }
  );

describe('Conferences', () => {
  it('renders initial state', () => {
    renderWithProviders(<Conferences />);
    expect(screen.getByTestId('conferences')).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /conferences/:id', async () => {
    renderConferences('/conferences/123');

    await waitFor(() => {
      expect(screen.getByTestId('detail-page-container')).toBeInTheDocument();
    });
  });

  it('navigates to SearchPage when /conferences', async () => {
    renderConferences('/conferences');

    await waitFor(() => {
      expect(screen.getByTestId('search-page-container')).toBeInTheDocument();
    });
  });
});
