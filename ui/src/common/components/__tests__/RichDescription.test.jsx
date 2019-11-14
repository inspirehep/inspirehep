import React from 'react';
import { shallow } from 'enzyme';

import RichDescription from '../RichDescription';

describe('RichDescription', () => {
  it('renders with description', () => {
    const wrapper = shallow(<RichDescription>description</RichDescription>);
    expect(wrapper).toMatchSnapshot();
  });
});
