import React from 'react';
import { shallow } from 'enzyme';

import HomePageSection from '../HomePageSection';

describe('HomePageSection', () => {
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
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only required props', () => {
    const wrapper = shallow(
      <HomePageSection
        title="Section"
        description="This is the description of this section"
      >
        <span>Content</span>
      </HomePageSection>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
