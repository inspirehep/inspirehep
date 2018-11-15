import React from 'react';
import { shallow } from 'enzyme';
import ErrorNetwork from '../ErrorNetwork';

describe('ErrorNetwork', () => {
  it('renders ErrorNetwork', () => {
    const wrapper = shallow(<ErrorNetwork />);
    expect(wrapper).toMatchSnapshot();
  });
});
