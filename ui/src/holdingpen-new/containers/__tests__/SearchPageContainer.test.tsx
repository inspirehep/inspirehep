import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import SearchPageContainer from '../SearchPageContainer/SearchPageContainer';

describe('SearchPageContainer', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new/search']}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders the SearchPage component', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen-new/search']}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );
    const searchPage = getByTestId('holdingpen-search-page');
    expect(searchPage).toBeInTheDocument();
  });
});
