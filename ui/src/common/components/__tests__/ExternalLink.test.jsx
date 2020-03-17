import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

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

  it('renders as custom component', () => {
    const wrapper = shallow(
      <ExternalLink href="//example.com" as={Button}>
        button example
      </ExternalLink>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
