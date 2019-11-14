import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import PaginationContainer from '../PaginationContainer';
import SearchPagination from '../../components/SearchPagination';
import { LITERATURE_NS } from '../../../reducers/search';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';

describe('PaginationContainer', () => {
  it('passes page, size and total from search namespace state', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { page: '2', size: '10' },
            total: 100,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <PaginationContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(SearchPagination)).toHaveProp({
      page: 2,
      pageSize: 10,
      total: 100,
    });
  });

  it('calls pushQueryToLocation onPageChange', () => {
    const store = getStore();
    const namespace = LITERATURE_NS;
    const wrapper = mount(
      <Provider store={store}>
        <PaginationContainer namespace={namespace} />
      </Provider>
    );
    const onPageChange = wrapper.find(SearchPagination).prop('onPageChange');
    const page = 3;

    onPageChange(page);

    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace, query: { page: '3' } },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
