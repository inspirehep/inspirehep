import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExportToCalendarAction from '../ExportToCalendarAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExportToCalendarAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with seminar', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [{ first_name: 'Harun', last_name: 'Urhan' }],
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });
    const wrapper = shallow(<ExportToCalendarAction seminar={seminar} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
