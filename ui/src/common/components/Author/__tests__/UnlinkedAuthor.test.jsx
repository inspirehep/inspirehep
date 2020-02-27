import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import UnlinkedAuthor from '../UnlinkedAuthor';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
    });
    const wrapper = shallow(<UnlinkedAuthor author={author} />);
    expect(wrapper).toMatchSnapshot();
  });
});
