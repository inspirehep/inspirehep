import React from 'react';
import { shallow } from 'enzyme';

import Home from '../';

describe('Home', () => {
  it('renders home page', () => {
    const wrapper = shallow(<Home />);
    expect(wrapper).toMatchSnapshot();
  });
});
