import React from 'react';
import { shallow } from 'enzyme';
import { Pagination } from 'antd';

import SearchPagination from '../SearchPagination';


describe('SearchPagination', () => {
  
  it('renders with all props set', () => {
    const wrapper = shallow(
      <SearchPagination
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SearchPagination total={100} onPageChange={jest.fn()} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onPageChange when pagination change', () => {
    
    const onPageChange = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SearchPagination total={100} onPageChange={onPageChange} />
    );
    const onPaginationCange = wrapper.find(Pagination).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onPaginationCange(2);
    
    expect(onPageChange).toBeCalledWith(2);
  });
});
