import React from 'react';
import { shallow } from 'enzyme';

import ResultItem from '../ResultItem';

describe('ResultItem', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <ResultItem
        title={<strong>title</strong>}
        actions={
          <ul>
            <li>action 1</li>
            <li>action 2</li>
          </ul>
        }
      >
        <span>More</span>
        <span>Content</span>
      </ResultItem>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
