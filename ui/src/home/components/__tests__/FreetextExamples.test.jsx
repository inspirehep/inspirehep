import React from 'react';
import { shallow } from 'enzyme';

import FreetextExamples from '../FreetextExamples';

describe('FreetextExamples', () => {
  it('renders', () => {
    const wrapper = shallow(<FreetextExamples />);
    expect(wrapper).toMatchSnapshot();
  });
});
