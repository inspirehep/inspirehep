import React from 'react';
import { shallow } from 'enzyme';
import SeminarTimezone from '../SeminarTimezone';

describe('SeminarTimezone', () => {
  it('renders with timezone', () => {
    const wrapper = shallow(<SeminarTimezone timezone="Europe/Zurich" />);
    expect(wrapper).toMatchSnapshot();
  });
});
