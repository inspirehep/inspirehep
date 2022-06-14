import React from 'react';
import { shallow } from 'enzyme';

import ResultItem from '../ResultItem';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ResultItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <ResultItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
