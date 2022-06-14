import React from 'react';
import { shallow } from 'enzyme';
import { advanceTo, clear } from 'jest-date-mock';
import DateFromNow from '../DateFromNow';

describe('UpdatedDate', () => {
  afterEach(() => {
    clear();
  });

  it('renders with updated', () => {
    advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const wrapper = shallow(<DateFromNow date="2019-05-28T13:30:00+00:00" />);
    expect(wrapper).toMatchSnapshot();
  });
});
