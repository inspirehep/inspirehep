import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceLocation from '../ConferenceLocation';

describe('ConferenceLocation', () => {
  it('renders with only city', () => {
    const location = fromJS({
      cities: ['Geneva', 'Ignored'],
    });
    const wrapper = shallow(<ConferenceLocation location={location} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with only country', () => {
    const location = fromJS({
      country: 'Switzerland',
    });
    const wrapper = shallow(<ConferenceLocation location={location} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with city and country', () => {
    const location = fromJS({
      cities: ['Geneva', 'Ignored'],
      country: 'Switzerland',
    });
    const wrapper = shallow(<ConferenceLocation location={location} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders empty', () => {
    const location = fromJS({});
    const wrapper = shallow(<ConferenceLocation location={location} />);
    expect(wrapper).toMatchSnapshot();
  });
});
