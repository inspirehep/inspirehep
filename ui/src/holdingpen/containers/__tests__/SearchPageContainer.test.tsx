import React from 'react';
import { render } from '@testing-library/react';

import SearchPageContainer from '../SearchPageContainer/SearchPageContainer';

describe('SearchPageContainer', () => {
  it('renders without crashing', () => {
    render(<SearchPageContainer />);
  });

  it('renders the SearchPage component', () => {
    const { getByTestId } = render(<SearchPageContainer />);
    const searchPage = getByTestId('holdingpen-search-page');
    expect(searchPage).toBeInTheDocument();
  });
});
