import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import InstitutionAddress from '../InstitutionAddress';

describe('InstitutionAddress', () => {
  it('renders with only postal address', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', 'CH-1211 Genève 23'],
    });
    const wrapper = shallow(<InstitutionAddress address={address} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with only country', () => {
    const address = fromJS({
      country: 'Switzerland',
    });
    const wrapper = shallow(<InstitutionAddress address={address} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with country already in postal address', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', '123 SWITZERLAND'],
      country: 'Switzerland',
    });
    const wrapper = shallow(<InstitutionAddress address={address} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with city already in postal address', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', '123 meyrin'],
      cities: ['Meyrin'],
    });
    const wrapper = shallow(<InstitutionAddress address={address} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders all', () => {
    const address = fromJS({
      postal_address: ['Rue Einstein', 'CH-1211 Genève 23'],
      cities: ['Meyrin'],
      country: 'Switzerland',
      state: 'Geneva',
      place_name: 'CERN',
    });
    const wrapper = shallow(<InstitutionAddress address={address} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders empty', () => {
    const address = fromJS({});
    const wrapper = shallow(<InstitutionAddress address={address} />);
    expect(wrapper).toMatchSnapshot();
  });
});
