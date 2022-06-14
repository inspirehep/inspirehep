import React from 'react';
import { shallow } from 'enzyme';

import RouterLinkButton from '../RouterLinkButton';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RouterLinkButton', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with className', () => {
    const wrapper = shallow(
      <RouterLinkButton className="test" to="/test">
        Test
      </RouterLinkButton>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without className', () => {
    const wrapper = shallow(
      <RouterLinkButton to="/test">Test</RouterLinkButton>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
