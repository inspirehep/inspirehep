import React from 'react';
import { shallow } from 'enzyme';

import BookSuggestion from '../BookSuggestion';

describe('BookSuggestion', () => {
  it('renders with full book', () => {
    const book = {
      titles: [{ title: 'A Book' }],
      authors: [{ full_name: '' }],
    };
    const wrapper = shallow(<BookSuggestion book={book} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only title', () => {
    const book = {
      titles: [{ title: 'A Book' }],
    };
    const wrapper = shallow(<BookSuggestion book={book} />);
    expect(wrapper).toMatchSnapshot();
  });
});
