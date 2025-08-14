import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { getStore } from './store';

export const renderWithRouter = (ui, { route = '/', initialIndex = 0 } = {}) =>
  render(
    <MemoryRouter initialEntries={[route]} initialIndex={initialIndex}>
      {ui}
    </MemoryRouter>
  );

export const renderWithProviders = (
  ui,
  { route = '/', initialState, store, ...renderOptions } = {}
) => {
  const usedStore = store ?? getStore(initialState);
  const Wrapper = ({ children }) => (
    <Provider store={usedStore}>
      <MemoryRouter initialEntries={[route]} initialIndex={0}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  const rendered = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    store: usedStore,
    ...rendered,
  };
};
