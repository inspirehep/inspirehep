import React from 'react';
import { shallow } from 'enzyme';
import AuthorBAI from '../AuthorBAI';

describe('AuthorBAI', () => {
  it('renders', () => {
    const wrapper = shallow(<AuthorBAI bai="F.Marchetto.1" />);
    expect(wrapper).toMatchSnapshot();
  });
});
