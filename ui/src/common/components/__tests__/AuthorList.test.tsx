import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Modal } from 'antd';

import AuthorList from '../AuthorList';
import InlineList from '../InlineList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ total: number; enableShowAll: true; author... Remove this comment to see the full error message
      <AuthorList total={6} enableShowAll authors={authors} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ total: number; authors: any; }' is not ass... Remove this comment to see the full error message
    const wrapper = shallow(<AuthorList total={6} authors={authors} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ limit: number; total: number; authors: any... Remove this comment to see the full error message
      <AuthorList limit={2} total={3} authors={authors} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ limit: number; total: number; authors: any... Remove this comment to see the full error message
      <AuthorList limit={2} total={3} authors={authors} enableShowAll />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders all authors if they are less than the limit without suffix', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ limit: number; authors: any; }' is not ass... Remove this comment to see the full error message
    const wrapper = shallow(<AuthorList limit={4} authors={authors} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders authors by using AuthorLink', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ limit: number; authors: any; }' is not ass... Remove this comment to see the full error message
    const wrapper = shallow(<AuthorList limit={4} authors={authors} />);

    // Can not dive since root is a Fragment
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      wrapper
        .find(InlineList)
        .first()
        .dive()
    ).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('prefixes `Supervisor` when 1 supervisor is passed', () => {
    const supervisors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ authors: any; forSupervisors: true; }' is ... Remove this comment to see the full error message
      <AuthorList authors={supervisors} forSupervisors />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      wrapper
        .find(InlineList)
        .first()
        .dive()
    ).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ authors: any; forSupervisors: true; }' is ... Remove this comment to see the full error message
      <AuthorList authors={supervisors} forSupervisors />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      wrapper
        .find(InlineList)
        .first()
        .dive()
    ).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should display `authors` in modal title by default', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ authors: any; }' is not assignable to type... Remove this comment to see the full error message
    const wrapper = shallow(<AuthorList authors={authors} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Modal)).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should show `supervisors` in modal title if supervisors are passed', () => {
    const supervisors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ authors: any; forSupervisors: true; }' is ... Remove this comment to see the full error message
      <AuthorList authors={supervisors} forSupervisors />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Modal)).toMatchSnapshot();
  });
});
