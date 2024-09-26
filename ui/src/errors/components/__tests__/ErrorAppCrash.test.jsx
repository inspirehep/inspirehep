import React from 'react';
import { shallow } from 'enzyme';
import ErrorAppCrash from '../ErrorAppCrash';

describe('ErrorAppCrash', () => {
  it('renders ErrorAppCrash', () => {
    const wrapper = shallow(<ErrorAppCrash />);
    expect(wrapper).toMatchSnapshot();
  });
});
