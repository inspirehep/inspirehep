import React from 'react';
import { render } from '@testing-library/react';
import { advanceTo, clear } from 'jest-date-mock';
import SeminarDateTimes from '../SeminarDateTimes';

describe('SeminarDateTimes', () => {
  it('renders with dates same day', () => {
    const { asFragment } = render(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2020-05-15T00:45:00.000000"
        timezone="Europe/Zurich"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders with dates different days', () => {
    const { asFragment } = render(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2021-05-17T00:45:00.000000"
        timezone="UTC"
        displayTimeZone
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders with timezone abbreviation', () => {
    advanceTo('2020-09-10');
    const { asFragment } = render(
      <SeminarDateTimes
        startDate="2020-05-15T11:45:00.000000"
        endDate="2021-05-17T00:45:00.000000"
        timezone="Europe/Zurich"
        displayTimezone
      />
    );
    expect(asFragment()).toMatchSnapshot();
    clear();
  });
});
