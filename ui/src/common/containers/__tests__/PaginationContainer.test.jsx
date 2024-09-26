import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import PaginationContainer from '../PaginationContainer';
import SearchPagination from '../../components/SearchPagination';
import { LITERATURE_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

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

  it('dispatcheds searchQueryUpdate onPageChange', () => {
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

    const expectedActions = [searchQueryUpdate(namespace, { page: '3' })];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches searchQueryUpdate onSizeChange', () => {
    const store = getStore();
    const namespace = LITERATURE_NS;
    const wrapper = mount(
      <Provider store={store}>
        <PaginationContainer namespace={namespace} />
      </Provider>
    );
    const onSizeChange = wrapper.find(SearchPagination).prop('onSizeChange');
    const page = 2;
    const size = 20;

    onSizeChange(page, size);

    const expectedActions = [searchQueryUpdate(namespace, { size, page: '1' })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
