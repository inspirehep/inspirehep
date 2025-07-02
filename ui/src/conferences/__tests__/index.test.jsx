import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Conferences from '..';

jest.mock('../containers/DetailPageContainer', () => () => (
  <div data-testid="detail-page-container">Detail Page</div>
));

jest.mock('../containers/SearchPageContainer', () => () => (
  <div data-testid="search-page-container">Search Page</div>
));

const renderWithProviders = (ui, { route = '/', ...renderOptions } = {}) => {
  const store = getStore();

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]} initialIndex={0}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('Conferences', () => {
  beforeEach(async () => {
    await Loadable.preloadAll();
  });

  it('renders initial state', () => {
    renderWithProviders(<Conferences />);
    expect(screen.getByTestId('conferences')).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /conferences/:id', async () => {
    renderWithProviders(<Conferences />, { route: '/conferences/123' });

    await waitFor(() => {
      expect(screen.getByTestId('detail-page-container')).toBeInTheDocument();
    });
  });

  it('navigates to SearchPage when /conferences', async () => {
    renderWithProviders(<Conferences />, { route: '/conferences' });

    await waitFor(() => {
      expect(screen.getByTestId('search-page-container')).toBeInTheDocument();
    });
  });
});
