import React from 'react';
import { shallow } from 'enzyme';
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
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
        title="Test"
        loading
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets props.onPageChange to Pagination.onChange', () => {
    const pageItems = Range(1, 25).toList();
    const onPageChange = jest.fn();
    const wrapper = shallow(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={25}
        page={1}
        total={100}
        onPageChange={onPageChange}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
      />
    ).dive();
    expect(wrapper.find(Pagination)).toHaveProp('onChange', onPageChange);
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
