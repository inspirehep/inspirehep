import React from 'react';
import { shallow } from 'enzyme';

import AuthorTwitterAction from '../AuthorTwitterAction';


describe('AuthorTwitterAction', () => {
  
  it('renders with twitter', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<AuthorTwitterAction twitter="harunurhan" />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
