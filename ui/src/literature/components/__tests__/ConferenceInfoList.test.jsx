import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceInfoList from '../ConferenceInfoList';

describe('ConferenceInfoList', () => {
  it('renders conference link', () => {
    const info = fromJS([
      {
        titles: [
          {
            title: 'Test Conferece 2',
            control_number: 111111,
          },
        ],
      },
      {
        titles: [
          {
            title: 'Test Conferece 2',
            control_number: 222222,
          },
        ],
      },
    ]);
    const wrapper = shallow(<ConferenceInfoList conferenceInfo={info} />);
    expect(wrapper).toMatchSnapshot();
  });
});
