import React from 'react';
import { shallow } from 'enzyme';
import { advanceTo, clear } from 'jest-date-mock';
import SeminarTimezone from '../SeminarTimezone';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SeminarTimezone', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with timezone', () => {
    advanceTo('2020-09-10');
    // @ts-expect-error ts-migrate(2786) FIXME: 'SeminarTimezone' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<SeminarTimezone timezone="Europe/Zurich" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
    clear();
  });
});
