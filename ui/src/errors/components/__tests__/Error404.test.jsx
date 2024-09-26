import React from 'react';
import { shallow } from 'enzyme';
import Error404 from '../Error404';

describe('Error404', () => {
  it('renders Error404 with correct props', () => {
    const wrapper = shallow(<Error404 />);
    expect(wrapper).toMatchSnapshot();
  });
});
