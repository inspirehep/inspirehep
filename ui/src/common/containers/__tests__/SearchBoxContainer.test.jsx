import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { replace } from 'connected-react-router';

import { getStoreWithState, mockActionCreator } from '../../../fixtures/store';
import SearchBoxContainer from '../SearchBoxContainer';
import SearchBox from '../../components/SearchBox';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

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
      searchQueryUpdate(searchBoxNamespace, { q: 'test' }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('resets the hash on search in collection different to literature', async () => {
    const currentNamespace = 'literature';
    const newNamespace = 'authors';
    const store = getStoreWithState({
      search: fromJS({
        currentNamespace,
      }),
      router: {
        location: {
          hash: '#whatever',
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <SearchBoxContainer />
      </Provider>
    );
    const onSearch = wrapper.find(SearchBox).prop('onSearch');
    onSearch(newNamespace, 'test');

    const expectedAction = replace({ hash: '' });
    expect(store.getActions()).toContainEqual(expectedAction);
  });
});
