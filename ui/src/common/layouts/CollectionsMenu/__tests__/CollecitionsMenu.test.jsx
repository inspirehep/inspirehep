import React from 'react';
import { shallow } from 'enzyme';

import CollectionsMenu from '../CollectionsMenu';

describe('CollectionsMenu', () => {
  it('renders', () => {
    const wrapper = shallow(
      <CollectionsMenu />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
