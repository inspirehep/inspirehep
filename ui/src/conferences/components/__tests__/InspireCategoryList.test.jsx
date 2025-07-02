import React from 'react';
import { render } from '@testing-library/react';
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
    const { asFragment } = render(
      <InspireCategoryList categories={categories} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
