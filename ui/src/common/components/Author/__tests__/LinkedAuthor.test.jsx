import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import LinkedAuthor from '../LinkedAuthor';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      record: {
        $ref: 'https://beta.inspirehep.net/api/authors/12345',
      },
      bai: 'Full.Name.1',
    });
    const wrapper = shallow(<LinkedAuthor author={author} />);
    expect(wrapper).toMatchSnapshot();
  });
});
