import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AddressList from '../AddressList';

describe('AddressList', () => {
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
    const wrapper = shallow(<AddressList addresses={addresses} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
