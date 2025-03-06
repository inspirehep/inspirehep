import React from 'react';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
import SearchResults from '../SearchResults';

describe('SearchResults', () => {
  it('renders with all props set', () => {
    const results = fromJS([
      {
        id: 1,
        value: 'value1',
      },
      {
        id: 2,
        value: 'value2',
      },
    ]);
    const { getByText } = render(
      <SearchResults
        results={results}
        renderItem={(result) => <span>{result.get('value')}</span>}
        isCatalogerLoggedIn={false}
        page={2}
        pageSize={10}
      />
    );
    expect(getByText('value1')).toBeInTheDocument();
    expect(getByText('value2')).toBeInTheDocument();
  });

  it('renders with required props', () => {
    const { getByTestId } = render(
      <SearchResults
        renderItem={(result) => <span>{result.get('value')}</span>}
        page={1}
        pageSize={15}
      />
    );
    expect(getByTestId('search-results')).toBeInTheDocument();
  });
});
