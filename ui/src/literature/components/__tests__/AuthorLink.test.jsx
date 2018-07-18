import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorLink from '../AuthorLink';

describe('AuthorLink', () => {
  it('renders with full author', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<AuthorLink author={author} recordId={12345} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders full author without recordId', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<AuthorLink author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders full author without last_name', () => {
    const author = fromJS({
      full_name: 'Name Full',
      first_name: 'Name Full',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<AuthorLink author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders author with only name fields', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
    });
    const wrapper = shallow(<AuthorLink recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });
});
