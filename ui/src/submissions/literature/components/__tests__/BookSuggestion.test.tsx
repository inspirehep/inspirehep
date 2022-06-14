import React from 'react';
import { shallow } from 'enzyme';

import BookSuggestion from '../BookSuggestion';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BookSuggestion', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with full book', () => {
    const book = {
      titles: [{ title: 'A Book' }],
      authors: [{ full_name: '' }],
    };
    const wrapper = shallow(<BookSuggestion book={book} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only title', () => {
    const book = {
      titles: [{ title: 'A Book' }],
    };
    const wrapper = shallow(<BookSuggestion book={book} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
