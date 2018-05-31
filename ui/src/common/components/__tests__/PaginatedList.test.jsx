import React from 'react';
import { shallow } from 'enzyme';
import { fromJS, Range } from 'immutable';
import { List } from 'antd';

import PaginatedList from '../PaginatedList';

describe('PaginatedList', () => {
  it('renders first page initially with default pageSize', () => {
    const items = Range(1, 100).toList();
    const wrapper = shallow(
      <PaginatedList
        items={items}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders first page initially with pageSize', () => {
    const items = Range(1, 100).toList();
    const wrapper = shallow(
      <PaginatedList
        items={items}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
        pageSize={10}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the new page on page change', () => {
    const items = Range(1, 100).toList();
    const page = 2;
    const wrapper = shallow(
      <PaginatedList
        items={items}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
        pageSize={10}
      />
    );
    wrapper.instance().onPageChange(page);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render at all if empty', () => {
    const items = fromJS([]);
    const wrapper = shallow(
      <PaginatedList
        items={items}
        renderItem={item => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  describe('getPageItems', () => {
    it('returns items for a page', () => {
      const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const page = 2;
      const pageSize = 3;
      const expected = fromJS([4, 5, 6]);
      const result = PaginatedList.getPageItems(items, page, pageSize);
      expect(result).toEqual(expected);
    });

    it('returns items for the first page', () => {
      const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const page = 1;
      const pageSize = 3;
      const expected = fromJS([1, 2, 3]);
      const result = PaginatedList.getPageItems(items, page, pageSize);
      expect(result).toEqual(expected);
    });

    it('returns only remaining items for the last page', () => {
      const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const page = 4;
      const pageSize = 3;
      const expected = fromJS([10]);
      const result = PaginatedList.getPageItems(items, page, pageSize);
      expect(result).toEqual(expected);
    });
  });
});
