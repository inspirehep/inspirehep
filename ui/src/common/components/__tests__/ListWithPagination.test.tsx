import React from 'react';
import { shallow, mount } from 'enzyme';
import { Range } from 'immutable';
import { List, Pagination } from 'antd';

import ListWithPagination from '../ListWithPagination';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ListWithPagination', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with required props', () => {
    const pageItems = Range(0, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pageItems: List<number>; pageSize: number;... Remove this comment to see the full error message
        pageItems={pageItems}
        pageSize={50}
        page={1}
        total={100}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onPageChange={jest.fn()}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props', () => {
    const pageItems = Range(1, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pageItems: List<number>; pageSize: number;... Remove this comment to see the full error message
        pageItems={pageItems}
        pageSize={25}
        page={2}
        total={100}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onPageChange={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onShowSizeChange={jest.fn()}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
        title="Test"
        loading
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders in grid mode', () => {
    const pageItems = Range(1, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pageItems: List<number>; pageSize: number;... Remove this comment to see the full error message
        pageItems={pageItems}
        pageSize={50}
        page={1}
        total={100}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onPageChange={jest.fn()}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
        grid
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets onPageChange and onSizeChange to Pagination', () => {
    const pageItems = Range(1, 25).toList();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onPageChange = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSizeChange = jest.fn();
    const wrapper = mount(
      <ListWithPagination
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ pageItems: List<number>; pageSize: number;... Remove this comment to see the full error message
        pageItems={pageItems}
        pageSize={25}
        page={1}
        total={100}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
        renderItem={(item: any) => <List.Item key={item}>{item}</List.Item>}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Pagination)).toHaveProp({
      onChange: onPageChange,
      onShowSizeChange: onSizeChange,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getPaginationRangeInfo', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns "pageStart-pageEnd of total"', () => {
      const range = [1, 5];
      const total = 10;
      const expected = '1-5 of 10';
      const result = ListWithPagination.getPaginationRangeInfo(total, range);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });
});
