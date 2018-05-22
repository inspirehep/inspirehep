import React from 'react';
import { shallow } from 'enzyme';

import AuthorLink from '../AuthorLink';

describe('AuthorLink', () => {
  it('renders with all props set', () => {
    const wrapper = shallow((
      <AuthorLink
        fullName="Name, Full"
        recordId={12345}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
