import React from 'react';
import { shallow } from 'enzyme';
import Error401 from '../components/Error401';

describe('Error401', () => {
  it('renders Error401 with correct props', () => {
    const wrapper = shallow(<Error401 />);
    expect(wrapper).toMatchSnapshot();
  });
});
