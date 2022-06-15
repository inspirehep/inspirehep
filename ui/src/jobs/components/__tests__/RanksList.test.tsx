import React from 'react';
import { shallow } from 'enzyme';
import { List } from 'immutable';

import RanksList from '../RanksList';


describe('RanksList', () => {
  
  it('renders ranks', () => {
    const ranks = List(['POSTDOC', 'PHD']);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<RanksList ranks={ranks} />);
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
