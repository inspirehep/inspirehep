import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Address from '../Address';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Address', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only city', () => {
    const address = fromJS({
      cities: ['Geneva', 'Ignored'],
    });
    const wrapper = shallow(<Address address={address} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only country', () => {
    const address = fromJS({
      country: 'Switzerland',
    });
    const wrapper = shallow(<Address address={address} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only place name', () => {
    const address = fromJS({
      place_name: 'CERN',
    });
    const wrapper = shallow(<Address address={address} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with city and country', () => {
    const address = fromJS({
      cities: ['Geneva', 'Ignored'],
      country: 'Switzerland',
    });
    const wrapper = shallow(<Address address={address} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders all', () => {
    const address = fromJS({
      cities: ['Meyrin'],
      country: 'Switzerland',
      state: 'Geneva',
      place_name: 'CERN',
    });
    const wrapper = shallow(<Address address={address} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty', () => {
    const address = fromJS({});
    const wrapper = shallow(<Address address={address} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
