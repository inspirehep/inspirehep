import React from 'react';
import { shallow } from 'enzyme';

import ExternalLink from '../ExternalLink';

describe('ExternalLink', () => {
  it('renders with only href and children', () => {
    const wrapper = shallow(
      <ExternalLink href="//example.com">example</ExternalLink>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only href, children and extra props', () => {
    const wrapper = shallow(
      <ExternalLink href="//example.com" className="test">
        example
      </ExternalLink>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
