import React from 'react';
import { shallow } from 'enzyme';

import HowToSubmit from '../HowToSubmit';

describe('HowToSubmit', () => {
  it('renders', () => {
    const wrapper = shallow(<HowToSubmit />);
    expect(wrapper).toMatchSnapshot();
  });
});
