import React from 'react';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
import ArxivCategoryList from '../ArxivCategoryList';

describe('ArxivCategoryList', () => {
  it('renders arxiv categories', () => {
    const arxivCategories = fromJS(['hep-ex', 'hep-ph']);
    const { getByText } = render(
      <ArxivCategoryList arxivCategories={arxivCategories} />
    );
    expect(getByText('hep-ex')).toBeInTheDocument();
    expect(getByText('hep-ph')).toBeInTheDocument();
  });
});
