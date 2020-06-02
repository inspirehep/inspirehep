import { fromJS } from 'immutable';

import getGoogleCalendarUrl from '../google';

describe('google', () => {
  it('matches google url with only required fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const url = getGoogleCalendarUrl(seminar);
    expect(url).toMatchSnapshot();
  });

  it('matches google url with all fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      abstract: {
        value: '<div>This is a <strong>test</strong> seminar<div>',
      },
      control_number: 12345,
      start_datetime: '2020-05-15T11:34:00.000000',
      end_datetime: '2020-05-15T17:34:00.000000',
      address: {
        cities: ['Geneva'],
        place_name: 'CERN',
      },
    });

    const url = getGoogleCalendarUrl(seminar);
    expect(url).toMatchSnapshot();
  });
});
