import React from 'react';
import { shallow } from 'enzyme';
import { advanceTo, clear } from 'jest-date-mock';
import SeminarTimezone from '../SeminarTimezone';

describe('SeminarTimezone', () => {
  it('renders with timezone', () => {
    advanceTo('2020-09-10');
    const wrapper = shallow(<SeminarTimezone timezone="Europe/Zurich" />);
    expect(wrapper).toMatchSnapshot();
    clear();
  });
});
