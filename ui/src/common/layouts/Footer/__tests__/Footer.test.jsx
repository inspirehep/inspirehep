import React from 'react';
import { shallow } from 'enzyme';

import Footer from '../Footer';

describe('Footer', () => {
  it('renders', () => {
    const wrapper = shallow(<Footer />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
