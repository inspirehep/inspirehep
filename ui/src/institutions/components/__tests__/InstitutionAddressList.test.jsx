import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import InstitutionAddressList from '../InstitutionAddressList';

describe('InstitutionAddressList', () => {
  it('renders with addresses', () => {
    const addresses = fromJS([
      {
        postal_address: ['Rue Einstein', 'CH-1211 Genève 23'],
        cities: ['Meyrin'],
        country: 'Switzerland',
        state: 'Geneva',
        place_name: 'CERN',
      },
      {
        cities: ['Geneva'],
        country: 'Switzerland',
      },
    ]);
    const { asFragment } = render(
      <InstitutionAddressList addresses={addresses} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
