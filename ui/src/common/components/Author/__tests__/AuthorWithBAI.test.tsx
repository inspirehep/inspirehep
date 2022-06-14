import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import AuthorWithBAI from '../AuthorWithBAI';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Name.Full.1',
    });
    const wrapper = shallow(<AuthorWithBAI author={author} />);
    expect(wrapper).toMatchSnapshot();
  });
});
