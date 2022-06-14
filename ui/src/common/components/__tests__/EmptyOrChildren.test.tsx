import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import EmptyOrChildren from '../EmptyOrChildren';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EmptyOrChildren', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if data is empty object', () => {
    const data = {};
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if data is empty array', () => {
    const data: any = [];
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if data is empty Map', () => {
    const data = fromJS({});
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if data is empty List', () => {
    const data = fromJS([]);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if data is null', () => {
    const data = null;
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{typeof data}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if data is non empty object', () => {
    const data = { foo: 'bar' };
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if data is non empty array', () => {
    const data = ['foo', 'bar'];
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if data is non empty Map', () => {
    const data = fromJS({ foo: 'bar' });
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if data is non empty List', () => {
    const data = fromJS(['foo', 'bar']);
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render children and shows title and description', () => {
    const data: any = [];
    const title = 'this is a title';
    const description = <div>this is a rich description</div>;
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <EmptyOrChildren data={data} title={title} description={description}>
        <div>{typeof data}</div>
      </EmptyOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
