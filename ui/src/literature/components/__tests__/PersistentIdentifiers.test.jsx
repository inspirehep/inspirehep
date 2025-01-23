import React from 'react';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(
      <PersistentIdentifiers identifiers={identifiers} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
