import React from 'react';
import { shallow } from 'enzyme';

import CollaborationLink from '../CollaborationLink';

describe('CollaborationLink', () => {
  it('renders with collaboration', () => {
    const wrapper = shallow(
      <CollaborationLink>Alias Investigations</CollaborationLink>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
