import React from 'react';
import { shallow } from 'enzyme';
import { advanceTo, clear } from 'jest-date-mock';
import SeminarTimezone from '../SeminarTimezone';


describe('SeminarTimezone', () => {
  
  it('renders with timezone', () => {
    advanceTo('2020-09-10');
    // @ts-expect-error ts-migrate(2786) FIXME: 'SeminarTimezone' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<SeminarTimezone timezone="Europe/Zurich" />);
    
    expect(wrapper).toMatchSnapshot();
    clear();
  });
});
