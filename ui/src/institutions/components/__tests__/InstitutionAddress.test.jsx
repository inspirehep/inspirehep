import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import InstitutionAddress from '../InstitutionAddress';

describe('InstitutionAddress', () => {
  it('renders with only postal address', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', 'CH-1211 Genève 23'],
    });
    const { asFragment } = render(<InstitutionAddress address={address} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders with only country', () => {
    const address = fromJS({
      country: 'Switzerland',
    });
    const { asFragment } = render(<InstitutionAddress address={address} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders with country already in postal address', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', '123 SWITZERLAND'],
      country: 'Switzerland',
    });
    const { asFragment } = render(<InstitutionAddress address={address} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders with city already in postal address', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', '123 meyrin'],
      cities: ['Meyrin'],
    });
    const { asFragment } = render(<InstitutionAddress address={address} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders all', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', 'CH-1211 Genève 23'],
      cities: ['Meyrin'],
      country: 'Switzerland',
      state: 'Geneva',
      place_name: 'CERN',
    });
    const { asFragment } = render(<InstitutionAddress address={address} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders empty', () => {
    const address = fromJS({});
    const { asFragment } = render(<InstitutionAddress address={address} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
