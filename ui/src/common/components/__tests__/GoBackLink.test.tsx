import React from 'react';
import { shallow } from 'enzyme';

import GoBackLink from '../GoBackLink';

describe('GoBackLink', () => {
  it('renders with default children', () => {
    const wrapper = shallow(<GoBackLink onClick={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with custom children', () => {
    const wrapper = shallow(
      <GoBackLink onClick={jest.fn()}>custom</GoBackLink>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
