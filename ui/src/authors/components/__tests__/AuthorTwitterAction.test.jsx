import React from 'react';
import { shallow } from 'enzyme';

import AuthorTwitterAction from '../AuthorTwitterAction';

describe('AuthorTwitterAction', () => {
  it('renders with twitter', () => {
    const wrapper = shallow(<AuthorTwitterAction twitter="harunurhan" />);
    expect(wrapper).toMatchSnapshot();
  });
});
