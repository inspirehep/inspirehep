import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceInfoList from '../ConferenceInfoList';

<<<<<<< Updated upstream

describe('ConferenceInfoList', () => {
  
=======
describe('ConferenceInfoList', () => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
