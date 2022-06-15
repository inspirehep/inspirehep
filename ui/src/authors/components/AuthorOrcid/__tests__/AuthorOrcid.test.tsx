import React from 'react';
import { shallow } from 'enzyme';

import AuthorOrcid from '../AuthorOrcid';


describe('AuthorOrcid', () => {
  
  it('renders with orcid', () => {
    const orcid = '0000-0001-8058-0014';
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<AuthorOrcid orcid={orcid} />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
