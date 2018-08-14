import React from 'react';
import { shallow } from 'enzyme';
import Error404 from '../components/Error404';

describe('Error404', () => {
  it('renders ErrorPage with correct props', () => {
    const wrapper = shallow(<Error404 />);
    expect(wrapper).toMatchSnapshot();
  });
});
