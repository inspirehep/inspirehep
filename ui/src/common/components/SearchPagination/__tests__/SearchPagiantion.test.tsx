import React from 'react';
import { shallow } from 'enzyme';
import { Pagination } from 'antd';

import SearchPagination from '../SearchPagination';

describe('SearchPagination', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <SearchPagination
        total={100}
        onPageChange={jest.fn()}
        page={2}
        pageSize={10}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only required props set', () => {
    const wrapper = shallow(
      <SearchPagination total={100} onPageChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onPageChange when pagination change', () => {
    const onPageChange = jest.fn();
    const wrapper = shallow(
      <SearchPagination total={100} onPageChange={onPageChange} />
    );
    const onPaginationCange = wrapper.find(Pagination).prop('onChange');
    onPaginationCange(2);
    expect(onPageChange).toBeCalledWith(2);
  });
});
