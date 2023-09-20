import React from 'react';
import { render } from '@testing-library/react';
import { Range } from 'immutable';
import { List } from 'antd';

import ListWithPagination from '../ListWithPagination';

describe('ListWithPagination', () => {
  it('renders with required props', () => {
    const pageItems = Range(0, 25).toList();
    const { asFragment } = render(
      <ListWithPagination
        // @ts-expect-error
        pageItems={pageItems}
        pageSize={50}
        page={1}
        total={100}
        onPageChange={jest.fn()}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with all props', () => {
    const pageItems = Range(1, 25).toList();
    const { asFragment } = render(
      <ListWithPagination
        // @ts-expect-error
        pageItems={pageItems}
        pageSize={25}
        page={2}
        total={100}
        onPageChange={jest.fn()}
        onShowSizeChange={jest.fn()}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
        title="Test"
        loading
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders in grid mode', () => {
    const pageItems = Range(1, 25).toList();
    const { asFragment } = render(
      <ListWithPagination
        // @ts-expect-error
        pageItems={pageItems}
        pageSize={50}
        page={1}
        total={100}
        onPageChange={jest.fn()}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
        grid
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
