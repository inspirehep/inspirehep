import React from 'react';
import { shallow } from 'enzyme';

import VerticalDivider from '../VerticalDivider';

describe('VerticalDivider', () => {
  it('renders', () => {
    const wrapper = shallow(<VerticalDivider />);
    expect(wrapper).toMatchSnapshot();
  });
});
