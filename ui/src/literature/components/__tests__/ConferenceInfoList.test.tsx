import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceInfoList from '../ConferenceInfoList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ConferenceInfoList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders conference link', () => {
    const info = fromJS([
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 111111,
      },
      {
        titles: [
          {
            title: 'Test Conferece 2',
          },
        ],
        control_number: 222222,
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ConferenceInfoList conferenceInfo={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
