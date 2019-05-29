import React from 'react';
import { shallow } from 'enzyme';

import Description from '../Description';

describe('Description', () => {
  it('renders with description', () => {
    const wrapper = shallow(<Description description="description" />);
    expect(wrapper).toMatchSnapshot();
  });
});
