import React from 'react';
import { shallow } from 'enzyme';
import AssignNoProfileAction from '../AssignNoProfileAction';

describe('AssignNoProfileAction', () => {
  it('renders', () => {
    const wrapper = shallow(<AssignNoProfileAction />);
    expect(wrapper).toMatchSnapshot();
  });
});
