import React from 'react';
import { shallow } from 'enzyme';

import LabelWithHelp from '../LabelWithHelp';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LabelWithHelp', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders label with help', () => {
    const wrapper = shallow(
      <LabelWithHelp label="Label" help="This is the help" />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
