import React from 'react';
import { shallow } from 'enzyme';
import { List } from 'immutable';

import RegionsList from '../RegionsList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RegionsList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders regions', () => {
    const regions = List(['Asia', 'North America']);
    const wrapper = shallow(<RegionsList regions={regions} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
