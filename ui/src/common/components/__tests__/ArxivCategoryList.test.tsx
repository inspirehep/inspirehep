import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ArxivCategoryList from '../ArxivCategoryList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ArxivCategoryList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders arxiv categories', () => {
    const arxivCategories = fromJS(['hep-ex', 'hep-ph']);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <ArxivCategoryList arxivCategories={arxivCategories} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
