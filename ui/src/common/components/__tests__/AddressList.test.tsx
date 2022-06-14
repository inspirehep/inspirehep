import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AddressList from '../AddressList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AddressList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
