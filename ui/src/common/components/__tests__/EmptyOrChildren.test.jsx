import React from 'react';
import { shallow } from 'enzyme';

import EmptyOrChildren from '../EmptyOrChildren';

describe('EmptyOrChildren', () => {
  it('renders empty if data is empty object', () => {
    const data = {};
    const wrapper = shallow(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders empty if data is empty array', () => {
    const data = [];
    const wrapper = shallow(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders empty if data is null', () => {
    const data = null;
    const wrapper = shallow(
      <EmptyOrChildren data={data}>
        <div>{typeof data}</div>
      </EmptyOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children if data is non empty object', () => {
    const data = { foo: 'bar' };
    const wrapper = shallow(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children if data is non empty array', () => {
    const data = ['foo', 'bar'];
    const wrapper = shallow(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
