import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceAddressList from '../ConferenceAddressList';

describe('ConferenceAddressList', () => {
  it('renders with addresses', () => {
    const addresses = fromJS([
      {
        place_name: 'CERN',
      },
      {
        cities: ['Geneva'],
        country: 'Switzerland',
      },
    ]);
    const wrapper = shallow(<ConferenceAddressList addresses={addresses} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
