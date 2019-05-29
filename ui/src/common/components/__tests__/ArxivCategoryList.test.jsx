import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ArxivCategoryList from '../ArxivCategoryList';

describe('ArxivCategoryList', () => {
  it('renders arxiv categories', () => {
    const arxivCategories = fromJS(['hep-ex', 'hep-ph']);
    const wrapper = shallow(
      <ArxivCategoryList arxivCategories={arxivCategories} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
