import React from 'react';
import { shallow } from 'enzyme';
import { advanceTo, clear } from 'jest-date-mock';
import DateFromNow from '../DateFromNow';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('UpdatedDate', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    clear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with updated', () => {
    advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<DateFromNow date="2019-05-28T13:30:00+00:00" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
