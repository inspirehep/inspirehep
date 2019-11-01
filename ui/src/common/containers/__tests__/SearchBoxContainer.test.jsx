import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import SearchBoxContainer from '../SearchBoxContainer';
import SearchBox from '../../components/SearchBox';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';

describe('SearchBoxContainer', () => {
  it('passes namespace query q param to SearchBox', () => {
    const searchBoxNamespace = 'literature';
    const store = getStoreWithState({
      search: fromJS({
        searchBoxNamespace,
        namespaces: {
          [searchBoxNamespace]: {
            query: { q: 'test' },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SearchBoxContainer />
      </Provider>
    );
    expect(wrapper.find(SearchBox)).toHaveProp({
      value: 'test',
      namespace: searchBoxNamespace,
    });
  });

  it('calls SEARCH_QUERY_UPDATE on search', async () => {
    const searchBoxNamespace = 'literature';
    const store = getStoreWithState({
      search: fromJS({
        searchBoxNamespace,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SearchBoxContainer />
      </Provider>
    );
    const onSearch = wrapper.find(SearchBox).prop('onSearch');
    onSearch(searchBoxNamespace, 'test');

    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { query: { q: 'test' }, namespace: searchBoxNamespace },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
