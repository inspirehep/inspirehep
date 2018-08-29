import React from 'react';
import { shallow } from 'enzyme';
import { Range } from 'immutable';
import { List } from 'antd';

import ListWithPagination from '../ListWithPagination';

describe('ListWithPagination', () => {
  it('renders with required props', () => {
    const pageItems = Range(0, 25).toList();
    const wrapper = shallow(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={50}
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
        total={100}
        onPageChange={jest.fn()}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
        title="Test"
        loading
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets new page state and calls props.onPageChange on page change', () => {
    const pageItems = Range(1, 25).toList();
    const onPageChangeProp = jest.fn();
    const wrapper = shallow(
      <ListWithPagination
        pageItems={pageItems}
        pageSize={25}
        total={100}
        onPageChange={onPageChangeProp}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
      />
    );
    const page = 2;
    wrapper.instance().onPageChange(page);
    wrapper.update();
    expect(wrapper.state('page')).toBe(page);
    expect(onPageChangeProp).toHaveBeenCalledWith(page);
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
