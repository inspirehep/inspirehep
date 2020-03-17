import React from 'react';
import { shallow } from 'enzyme';

import RouterLinkButton from '../RouterLinkButton';

describe('RouterLinkButton', () => {
  it('renders with className', () => {
    const wrapper = shallow(
      <RouterLinkButton className="test" to="/test">
        Test
      </RouterLinkButton>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without className', () => {
    const wrapper = shallow(
      <RouterLinkButton to="/test">Test</RouterLinkButton>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
