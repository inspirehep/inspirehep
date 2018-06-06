import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorList from '../AuthorList';
import AuthorLink from '../AuthorLink';

describe('AuthorList', () => {
  it('renders only 5 authors and suffixes "et al." if passed more', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
      {
        full_name: 'Test, Guy 4',
      },
      {
        full_name: 'Test, Guy 5',
      },
      {
        full_name: 'Test, Guy 6',
      },
    ]);
    const wrapper = shallow(<AuthorList recordId={12345} authors={authors} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only limited (prop) authors and suffixes "et al." if passed more', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
    ]);
    const wrapper = shallow(
      <AuthorList limit={2} recordId={12345} authors={authors} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders all authors if they are less than the limit wihtout "et al."', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const wrapper = shallow(
      <AuthorList limit={4} recordId={12345} authors={authors} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders authors by using AuthorLink', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorList limit={4} recordId={12345} authors={authors} />
    );
    expect(wrapper.dive().find(AuthorLink).length).toBe(1);
  });
});
