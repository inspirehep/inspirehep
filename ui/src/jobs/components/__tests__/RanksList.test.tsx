import React from 'react';
import { shallow } from 'enzyme';
import { List } from 'immutable';

import RanksList from '../RanksList';

describe('RanksList', () => {
  it('renders ranks', () => {
    const ranks = List(['POSTDOC', 'PHD']);
    const wrapper = shallow(<RanksList ranks={ranks} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
