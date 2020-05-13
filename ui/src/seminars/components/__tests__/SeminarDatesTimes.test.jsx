import React from 'react';
import { shallow } from 'enzyme';
import SeminarDateTimes from '../SeminarDateTimes';

describe('SeminarDateTimes', () => {
  it('renders with dates same day', () => {
    const wrapper = shallow(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2020-05-15T00:45:00.000000"
        timezone="Europe/Zurich"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with dates different days', () => {
    const wrapper = shallow(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2021-05-17T00:45:00.000000"
        timezone="UTC"
        displayTimeZone
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with timezone abbreviation', () => {
    const wrapper = shallow(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2021-05-17T00:45:00.000000"
        timezone="Europe/Zurich"
        displayTimezone
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
