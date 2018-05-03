import React from 'react';
import { shallow } from 'enzyme';

import ResultItem from '../ResultItem';

describe('ResultItem', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow((
      <ResultItem
        title={<strong>title</strong>}
        description={<div>description...</div>}
      >
        <span>More</span>
        <span>Content</span>
      </ResultItem>
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
