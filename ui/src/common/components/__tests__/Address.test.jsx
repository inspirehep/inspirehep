import React from 'react';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
import Address from '../Address';

describe('Address', () => {
  it('renders with only city', () => {
    const address = fromJS({
      cities: ['Geneva', 'Ignored'],
    });
    const { getByText, queryByText } = render(<Address address={address} />);
    expect(getByText('Geneva')).toBeInTheDocument();
    expect(queryByText('Ignored')).toBeNull();
  });

  it('renders with only country', () => {
    const address = fromJS({
      country: 'Switzerland',
    });
    const { getByText } = render(<Address address={address} />);
    expect(getByText('Switzerland')).toBeInTheDocument();
  });

  it('renders with only place name', () => {
    const address = fromJS({
      place_name: 'CERN',
    });
    const { getByText } = render(<Address address={address} />);
    expect(getByText('CERN')).toBeInTheDocument();
  });

  it('renders with city and country', () => {
    const address = fromJS({
      cities: ['Geneva', 'Ignored'],
      country: 'Switzerland',
    });
    const { getByText, queryByText } = render(<Address address={address} />);
    expect(getByText('Geneva')).toBeInTheDocument();
    expect(queryByText('Ignored')).toBeNull();
    expect(getByText('Switzerland')).toBeInTheDocument();
  });

  it('renders all', () => {
    const address = fromJS({
      cities: ['Meyrin'],
      country: 'Switzerland',
      state: 'Geneva',
      place_name: 'CERN',
    });
    const { getByText } = render(<Address address={address} />);
    expect(getByText('Meyrin')).toBeInTheDocument();
    expect(getByText('Switzerland')).toBeInTheDocument();
    expect(getByText('Geneva')).toBeInTheDocument();
    expect(getByText('CERN')).toBeInTheDocument();
  });

  it('renders empty', () => {
    const address = fromJS({});
    const { queryAllByRole } = render(<Address address={address} />);
    const listItems = queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });
});
