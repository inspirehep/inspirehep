import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import ExportToCalendarAction from '../ExportToCalendarAction';

describe('ExportToCalendarAction', () => {
  it('renders with seminar', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [{ first_name: 'Harun', last_name: 'Urhan' }],
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });
    const { asFragment } = render(<ExportToCalendarAction seminar={seminar} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
