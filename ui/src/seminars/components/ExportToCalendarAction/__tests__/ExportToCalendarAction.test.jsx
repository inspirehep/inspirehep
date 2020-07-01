import React from 'react';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(<ExportToCalendarAction seminar={seminar} />);
    expect(wrapper).toMatchSnapshot();
  });
});
