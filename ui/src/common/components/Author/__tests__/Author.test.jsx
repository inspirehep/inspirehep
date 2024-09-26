import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Author from '..';

describe('Author', () => {
  it('renders unlinkedAuthor with affiliations', () => {
    const author = fromJS({
      full_name: 'Name, Full, Jr.',
      first_name: 'Full, Jr.',
      last_name: 'Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<Author author={author} recordId={12345} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders editor', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
      inspire_roles: ['editor'],
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders supervisor', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      inspire_roles: ['supervisor'],
    });
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders linked author', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      record: {
        $ref: 'https://beta.inspirehep.net/api/authors/12345',
      },
      bai: 'Full.Name.1',
    });
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders unlinked author with bai', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Full.Name.1',
    });
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });
});
