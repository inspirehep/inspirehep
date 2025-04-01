import React from 'react';
import { render } from '@testing-library/react';

import BookSuggestion from '../BookSuggestion';

describe('BookSuggestion', () => {
  it('renders with full book', () => {
    const book = {
      titles: [{ title: 'A Book' }],
      authors: [{ full_name: '' }],
    };
    const { asFragment } = render(<BookSuggestion book={book} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only title', () => {
    const book = {
      titles: [{ title: 'A Book' }],
    };
    const { asFragment } = render(<BookSuggestion book={book} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
