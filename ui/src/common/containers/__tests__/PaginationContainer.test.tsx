import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PaginationContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(SearchPagination)).toHaveProp({
      page: 2,
      pageSize: 10,
      total: 100,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
