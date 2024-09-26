import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InspireCategoryList from '../InspireCategoryList';

describe('InspireCategoryList', () => {
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
    expect(wrapper).toMatchSnapshot();
  });
});
