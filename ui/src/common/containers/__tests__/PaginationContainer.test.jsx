import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import PaginationContainer, { dispatchToProps } from '../PaginationContainer';
import { pushQueryToLocation } from '../../../actions/search';
import SearchPagination from '../../components/SearchPagination';

jest.mock('../../../actions/search');

describe('PaginationContainer', () => {
  afterEach(() => {
    pushQueryToLocation.mockClear();
  });

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
    const wrapper = mount(
      <Provider store={store}>
        <PaginationContainer />
      </Provider>
    );
    expect(wrapper.find(SearchPagination)).toHaveProp({
      page: 2,
      pageSize: 10,
      total: 100,
    });
  });

  it('calls pushQueryToLocation onPageChange', () => {
    const props = dispatchToProps(jest.fn());
    const page = 3;
    props.onPageChange(page);
    expect(pushQueryToLocation).toHaveBeenCalledWith({ page });
  });
});
