import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import PaginationContainer, { dispatchToProps } from '../PaginationContainer';
import * as search from '../../../actions/search';
import SearchPagination from '../../components/SearchPagination';

jest.mock('../../../actions/search');

describe('PaginationContainer', () => {
  it('passes page, size and total from state', () => {
    const store = getStoreWithState({
      router: {
        location: {
          query: {
            size: '10',
            page: '2',
          },
        },
      },
      search: fromJS({
        total: 100,
      }),
    });
    const wrapper = mount(<PaginationContainer store={store} />);
    const dummyWrapper = wrapper.find(SearchPagination);
    expect(dummyWrapper).toHaveProp('page', 2);
    expect(dummyWrapper).toHaveProp('pageSize', 10);
    expect(dummyWrapper).toHaveProp('total', 100);
  });

  it('calls pushQueryToLocation onPageChange', () => {
    const mockPushQueryToLocation = jest.fn();
    search.pushQueryToLocation = mockPushQueryToLocation;
    const props = dispatchToProps(jest.fn());
    const page = 3;
    props.onPageChange(page);
    expect(mockPushQueryToLocation).toHaveBeenCalledWith({ page });
  });
});
