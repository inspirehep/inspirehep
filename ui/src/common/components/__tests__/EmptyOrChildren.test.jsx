import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import EmptyOrChildren from '../EmptyOrChildren';

describe('EmptyOrChildren', () => {
  it('renders empty if data is empty object', () => {
    const data = {};
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(getByText('No data')).toBeInTheDocument();
  });

  it('renders empty if data is empty array', () => {
    const data = [];
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(getByText('No data')).toBeInTheDocument();
  });

  it('renders empty if data is empty Map', () => {
    const data = fromJS({});
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(getByText('No data')).toBeInTheDocument();
  });

  it('renders empty if data is empty List', () => {
    const data = fromJS([]);
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(getByText('No data')).toBeInTheDocument();
  });

  it('renders children if data is null', () => {
    const data = null;
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{typeof data}</div>
      </EmptyOrChildren>
    );
    expect(getByText('object')).toBeInTheDocument();
  });

  it('renders children if data is non empty object', () => {
    const data = { foo: 'bar' };
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.foo}</div>
      </EmptyOrChildren>
    );
    expect(getByText('bar')).toBeInTheDocument();
  });

  it('renders children if data is non empty array', () => {
    const data = ['foo', 'bar'];
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.toString()}</div>
      </EmptyOrChildren>
    );
    expect(getByText('foo,bar')).toBeInTheDocument();
  });

  it('renders children if data is non empty Map', () => {
    const data = fromJS({ foo: 'bar' });
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>{data.get('foo')}</div>
      </EmptyOrChildren>
    );
    expect(getByText('bar')).toBeInTheDocument();
  });

  it('renders children if data is non empty List', () => {
    const data = fromJS(['foo', 'bar']);
    const { getByText } = render(
      <EmptyOrChildren data={data}>
        <div>foo</div>
      </EmptyOrChildren>
    );
    expect(getByText('foo')).toBeInTheDocument();
  });

  it('does not render children and shows title and description', () => {
    const data = [];
    const title = 'this is a title';
    const description = <div>this is a rich description</div>;
    const { getByText } = render(
      <EmptyOrChildren data={data} title={title} description={description}>
        <div>{typeof data}</div>
      </EmptyOrChildren>
    );
    expect(getByText('this is a title')).toBeInTheDocument();
    expect(getByText('this is a rich description')).toBeInTheDocument();
  });
});
