import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { changeSearchScope } from '../../../actions/search';
import { getStoreWithState, getStore } from '../../../fixtures/store';
import SearchScopeSelectContainer from '../SearchScopeSelectContainer';
import SearchScopeSelect from '../../components/SearchScopeSelect';

jest.mock('../../../actions/search');

changeSearchScope.mockReturnValue(async () => {});

describe('SearchScopeSelectContainer', () => {
  afterEach(() => {
    changeSearchScope.mockClear();
  });

  it('passes url query q param to SearchBox', () => {
    const store = getStoreWithState({
      search: fromJS({
        scope: {
          name: 'authors',
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SearchScopeSelectContainer />
      </Provider>
    );
    expect(wrapper.find(SearchScopeSelect)).toHaveProp({
      searchScopeName: 'authors',
    });
  });

  it('calls changeSearchScope onSearchScopeChange', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SearchScopeSelectContainer />
      </Provider>
    );
    const onSearchScopeChange = wrapper
      .find(SearchScopeSelect)
      .prop('onSearchScopeChange');
    onSearchScopeChange('test');
    expect(changeSearchScope).toHaveBeenCalledWith('test');
  });
});
