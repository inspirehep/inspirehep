import React from 'react';
import { shallow } from 'enzyme';

import AuthorLinkedinAction from '../AuthorLinkedinAction';

describe('AuthorLinkedinAction', () => {
  it('renders with linkedin', () => {
    const wrapper = shallow(<AuthorLinkedinAction linkedin="harunurhan" />);
    expect(wrapper).toMatchSnapshot();
  });
});
