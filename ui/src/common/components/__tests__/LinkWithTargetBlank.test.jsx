import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import LinkWithTargetBlank from '../LinkWithTargetBlank';

describe('LinkWithTargetBlank', () => {
  it('renders with only href and children', () => {
    const wrapper = shallow(
      <LinkWithTargetBlank href="//example.com">example</LinkWithTargetBlank>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only href, children and extra props', () => {
    const wrapper = shallow(
      <LinkWithTargetBlank href="//example.com" className="test">
        example
      </LinkWithTargetBlank>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders as custom component', () => {
    const wrapper = shallow(
      <LinkWithTargetBlank href="//example.com" as={Button}>
        button example
      </LinkWithTargetBlank>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
