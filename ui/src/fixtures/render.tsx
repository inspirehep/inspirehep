import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { getStore } from './store';

export const renderWithRouter = (
  ui: React.ReactElement,
  {
    route = '/',
    initialIndex = 0,
  }: { route?: string; initialIndex?: number } = {}
) =>
  render(
    <MemoryRouter initialEntries={[route]} initialIndex={initialIndex}>
      <>{ui}</>
    </MemoryRouter>
  );

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    route = '/',
    initialState,
    store,
    ...renderOptions
  }: {
    route?: string;
    initialState?: any;
    store?: any;
    [key: string]: any;
  } = {}
) => {
  const usedStore = store ?? getStore(initialState);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={usedStore}>
      <MemoryRouter initialEntries={[route]} initialIndex={0}>
        <>{children}</>
      </MemoryRouter>
    </Provider>
  );

  const rendered = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    store: usedStore,
    ...rendered,
  };
};
