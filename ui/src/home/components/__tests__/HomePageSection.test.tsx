import React from 'react';
import { shallow } from 'enzyme';

import HomePageSection from '../HomePageSection';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('HomePageSection', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props', () => {
    const wrapper = shallow(
      <HomePageSection
        className="white-background"
        title="Section"
        description="This is the description of this section"
      >
        <span>Content</span>
      </HomePageSection>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only required props', () => {
    const wrapper = shallow(
      <HomePageSection
        title="Section"
        description="This is the description of this section"
      >
        <span>Content</span>
      </HomePageSection>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
