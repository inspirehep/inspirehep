import React from 'react';
import { shallow } from 'enzyme';
import { advanceTo, clear } from 'jest-date-mock';
import SeminarDateTimes from '../SeminarDateTimes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SeminarDateTimes', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with dates same day', () => {
    const wrapper = shallow(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2020-05-15T00:45:00.000000"
        timezone="Europe/Zurich"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with dates different days', () => {
    const wrapper = shallow(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2021-05-17T00:45:00.000000"
        timezone="UTC"
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ startDate: string; endDate: string; timezo... Remove this comment to see the full error message
        displayTimeZone
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with timezone abbreviation', () => {
    advanceTo('2020-09-10');
    const wrapper = shallow(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2021-05-17T00:45:00.000000"
        timezone="Europe/Zurich"
        displayTimezone
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
    clear();
  });
});
