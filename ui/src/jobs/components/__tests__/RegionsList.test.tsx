import React from 'react';
import { shallow } from 'enzyme';
import { List } from 'immutable';

import RegionsList from '../RegionsList';

describe('RegionsList', () => {
  it('renders regions', () => {
    const regions = List(['Asia', 'North America']);
    const wrapper = shallow(<RegionsList regions={regions} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
