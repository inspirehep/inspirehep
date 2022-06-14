import React from 'react';
import { shallow, mount } from 'enzyme';
import { Range } from 'immutable';
import { List, Pagination } from 'antd';

import ListWithPagination from '../ListWithPagination';

describe('ListWithPagination', () => {
  it('renders with required props', () => {
    const pageItems = Range(0, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={50}
        page={1}
        total={100}
        onPageChange={jest.fn()}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with all props', () => {
    const pageItems = Range(1, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={25}
        page={2}
        total={100}
        onPageChange={jest.fn()}
        onShowSizeChange={jest.fn()}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
        title="Test"
        loading
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders in grid mode', () => {
    const pageItems = Range(1, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={50}
        page={1}
        total={100}
        onPageChange={jest.fn()}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
        grid
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets onPageChange and onSizeChange to Pagination', () => {
    const pageItems = Range(1, 25).toList();
    const onPageChange = jest.fn();
    const onSizeChange = jest.fn();
    const wrapper = mount(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={25}
        page={1}
        total={100}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(wrapper.find(Pagination)).toHaveProp({
      onChange: onPageChange,
      onShowSizeChange: onSizeChange,
    });
  });

  describe('getPaginationRangeInfo', () => {
    it('returns "pageStart-pageEnd of total"', () => {
      const range = [1, 5];
      const total = 10;
      const expected = '1-5 of 10';
      const result = ListWithPagination.getPaginationRangeInfo(total, range);
      expect(result).toEqual(expected);
    });
  });
});
