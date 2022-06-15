import React from 'react';
import { shallow } from 'enzyme';

import AuthorLinkedinAction from '../AuthorLinkedinAction';


describe('AuthorLinkedinAction', () => {
  
  it('renders with linkedin', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<AuthorLinkedinAction linkedin="harunurhan" />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
