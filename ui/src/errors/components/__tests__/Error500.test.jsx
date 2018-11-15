import React from 'react';
import { shallow } from 'enzyme';
import Error500 from '../Error500';

describe('Error500', () => {
  it('renders Error500', () => {
    const wrapper = shallow(<Error500 />);
    expect(wrapper).toMatchSnapshot();
  });
});
