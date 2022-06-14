import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Modal } from 'antd';

import AuthorList from '../AuthorList';
import InlineList from '../InlineList';

describe('AuthorList', () => {
  it('renders only 5 authors and suffixes "show all" if passed more', () => {
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
    const wrapper = shallow(
      <AuthorList total={6} enableShowAll authors={authors} />
    );
    expect(wrapper).toMatchSnapshot();
  });

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
    const wrapper = shallow(<AuthorList total={6} authors={authors} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only limited (prop) authors and suffixes "et all." if passed more', () => {
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
      <AuthorList limit={2} total={3} authors={authors} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only limited (prop) authors and suffixes "show all." if passed more', () => {
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
      <AuthorList limit={2} total={3} authors={authors} enableShowAll />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all authors if they are less than the limit without suffix', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const wrapper = shallow(<AuthorList limit={4} authors={authors} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders authors by using AuthorLink', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(<AuthorList limit={4} authors={authors} />);

    // Can not dive since root is a Fragment
    expect(
      wrapper
        .find(InlineList)
        .first()
        .dive()
    ).toMatchSnapshot();
  });

  it('prefixes `Supervisor` when 1 supervisor is passed', () => {
    const supervisors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorList authors={supervisors} forSupervisors />
    );
    expect(
      wrapper
        .find(InlineList)
        .first()
        .dive()
    ).toMatchSnapshot();
  });

  it('prefixes `Supervisor` when 2 or more supervisors are passed', () => {
    const supervisors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const wrapper = shallow(
      <AuthorList authors={supervisors} forSupervisors />
    );
    expect(
      wrapper
        .find(InlineList)
        .first()
        .dive()
    ).toMatchSnapshot();
  });

  it('should display `authors` in modal title by default', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(<AuthorList authors={authors} />);
    expect(wrapper.find(Modal)).toMatchSnapshot();
  });

  it('should show `supervisors` in modal title if supervisors are passed', () => {
    const supervisors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorList authors={supervisors} forSupervisors />
    );
    expect(wrapper.find(Modal)).toMatchSnapshot();
  });
});
