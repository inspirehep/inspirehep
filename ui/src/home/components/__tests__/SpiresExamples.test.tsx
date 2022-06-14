import React from 'react';
import { shallow } from 'enzyme';

import SpiresExamples from '../SpiresExamples';

describe('SpiresExamples', () => {
  it('renders', () => {
    const wrapper = shallow(<SpiresExamples />);
    expect(wrapper).toMatchSnapshot();
  });
});
