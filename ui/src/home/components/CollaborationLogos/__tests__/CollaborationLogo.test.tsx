import React from 'react';
import { shallow } from 'enzyme';

import CollaborationLogo from '../CollaborationLogo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CollaborationLogo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('render with all props', () => {
    const wrapper = shallow(
      <CollaborationLogo
        name="CERN"
        href="https://home.cern"
        src="/link/to/logo.png"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
