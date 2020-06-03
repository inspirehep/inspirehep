import React from 'react';
import { shallow } from 'enzyme';

import NewFeatureTag from '../NewFeatureTag';

describe('NewFeatureTag', () => {
  it('renders', () => {
    const wrapper = shallow(<NewFeatureTag />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with class name', () => {
    const wrapper = shallow(<NewFeatureTag className="test" />);
    expect(wrapper).toMatchSnapshot();
  });
});
