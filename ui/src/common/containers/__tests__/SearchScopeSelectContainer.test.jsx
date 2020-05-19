import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import SearchScopeSelectContainer from '../SearchScopeSelectContainer';
import SearchScopeSelect from '../../components/SearchScopeSelect';
import { CHANGE_SEARCH_BOX_NAMESPACE } from '../../../actions/actionTypes';
import { AUTHORS_NS } from '../../../search/constants';

describe('SearchScopeSelectContainer', () => {
  it('passes url query q param to SearchBox', () => {
    const searchBoxNamespace = AUTHORS_NS;
    const store = getStoreWithState({
      search: fromJS({
        searchBoxNamespace,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SearchScopeSelectContainer />
      </Provider>
    );
    expect(wrapper.find(SearchScopeSelect)).toHaveProp({
      searchScopeName: searchBoxNamespace,
    });
  });

  it('dispatches CHANGE_SEARCH_BOX_NAMESPACE on change', async () => {
    const searchBoxNamespace = AUTHORS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <SearchScopeSelectContainer />
      </Provider>
    );
    const onSearchScopeChange = wrapper
      .find(SearchScopeSelect)
      .prop('onSearchScopeChange');
    onSearchScopeChange(searchBoxNamespace);
    const expectedActions = [
      {
        type: CHANGE_SEARCH_BOX_NAMESPACE,
        payload: { searchBoxNamespace },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
