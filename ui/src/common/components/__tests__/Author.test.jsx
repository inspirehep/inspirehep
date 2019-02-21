import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Author from '../Author';

describe('Author', () => {
  it('renders first_name and last_name with affiliations', () => {
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
    const wrapper = shallow(<Author author={author} recordId={12345} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders full_name with affiliations', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<Author author={author} recordId={12345} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders full_name with first_name missing', () => {
    const author = fromJS({
      full_name: 'Name Full',
      last_name: 'Last Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<Author author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders first_name with last_name missing', () => {
    const author = fromJS({
      full_name: 'Name Full',
      first_name: 'Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<Author author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders full_name if first_name and last_name missing', () => {
    const author = fromJS({
      full_name: 'Name Full',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const wrapper = shallow(<Author author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders first_name and last_name', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
    });
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders first_name and last_name of editor', () => {
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
        $ref: 'https://beta.inspirehep.net/api/authors/12345'
      }
    });
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    expect(wrapper).toMatchSnapshot();
  });
});
