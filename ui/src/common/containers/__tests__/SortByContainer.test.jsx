import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import SortByContainer from '../SortByContainer';
import SortBy from '../../components/SortBy';
import { LITERATURE_NS } from '../../../search/constants';

import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('SortByContainer', () => {
  it('passes namespace query sort param to SortBy', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostrecent' },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SortByContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(SortBy)).toHaveProp({ sort: 'mostrecent' });
  });

  it('dispatches SEARCH_QUERY_UPDATE on sort change', () => {
    const store = getStore();
    const namespace = LITERATURE_NS;
    const wrapper = mount(
      <Provider store={store}>
        <SortByContainer namespace={namespace} />
      </Provider>
    );
    const onSortChange = wrapper.find(SortBy).prop('onSortChange');
    const sort = 'mostcited';
    onSortChange(sort);
    const expectedActions = [searchQueryUpdate(namespace, { sort, page: '1' })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
