import React from 'react';
import { shallow } from 'enzyme';

import BookSuggestion from '../BookSuggestion';

describe('BookSuggestion', () => {
  it('renders with full book', () => {
    const book = {
      titles: [{ title: 'A Book' }],
      authors: [{ full_name: '' }],
    };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<BookSuggestion book={book} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only title', () => {
    const book = {
      titles: [{ title: 'A Book' }],
    };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<BookSuggestion book={book} />);
    expect(wrapper).toMatchSnapshot();
  });
});
