import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InspireCategoryList from '../InspireCategoryList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('InspireCategoryList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with categories', () => {
    const categories = fromJS([
      {
        value: 'Accelerators',
      },
      {
        value: 'Lattice',
      },
    ]);
    const wrapper = shallow(<InspireCategoryList categories={categories} />);
    // FIXME: we need to .dive().dive() to be able test list items
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
