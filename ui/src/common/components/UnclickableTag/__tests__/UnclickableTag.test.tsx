import React from 'react';
import { shallow } from 'enzyme';

import UnclickableTag from '../UnclickableTag';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('UnclickableTag', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const wrapper = shallow(
      <UnclickableTag
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        className="this-is-a-test-class"
        color="blue"
        visible
        closable
      >
        This is a tag
      </UnclickableTag>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without props', () => {
    const wrapper = shallow(<UnclickableTag>This is a tag</UnclickableTag>);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
