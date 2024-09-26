import React from 'react';
import { shallow } from 'enzyme';

import AuthorOrcid from '../AuthorOrcid';

describe('AuthorOrcid', () => {
  it('renders with orcid', () => {
    const orcid = '0000-0001-8058-0014';
    const wrapper = shallow(<AuthorOrcid orcid={orcid} />);
    expect(wrapper).toMatchSnapshot();
  });
});
