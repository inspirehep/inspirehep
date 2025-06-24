import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import PersistentIdentifiers from '../PersistentIdentifiers';

describe('PersistentIdentifiers', () => {
  it('renders with identifiers', () => {
    const identifiers = fromJS([
      {
        value: '1866/20706',
        schema: 'HDL',
      },
      {
        value: '12345',
        schema: 'URN',
      },
    ]);
    const { asFragment } = render(
      <PersistentIdentifiers identifiers={identifiers} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
