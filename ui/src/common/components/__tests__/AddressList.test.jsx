import React from 'react';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
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
    const { getByText } = render(<AddressList addresses={addresses} />);
    expect(getByText('CERN')).toBeInTheDocument();
    expect(getByText('Geneva')).toBeInTheDocument();
    expect(getByText('Switzerland')).toBeInTheDocument();
  });
});
