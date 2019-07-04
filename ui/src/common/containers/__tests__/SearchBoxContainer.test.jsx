import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { pushQueryToLocation } from '../../../actions/search';
import { getStoreWithState, getStore } from '../../../fixtures/store';
import SearchBoxContainer from '../SearchBoxContainer';
import SearchBox from '../../components/SearchBox';

jest.mock('../../../actions/search');

pushQueryToLocation.mockReturnValue(async () => {});

describe('SearchBoxContainer', () => {
  afterEach(() => {
    pushQueryToLocation.mockClear();
  });

  it('passes url query q param to SearchBox', () => {
    const store = getStoreWithState({
      router: { location: { query: { q: 'test' } } },
    });
    const wrapper = mount(
      <Provider store={store}>
        <SearchBoxContainer />
      </Provider>
    );
    expect(wrapper.find(SearchBox)).toHaveProp({ value: 'test' });
  });

  it('calls pushQueryToLocation onSearch', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SearchBoxContainer />
      </Provider>
    );
    const onSearch = wrapper.find(SearchBox).prop('onSearch');
    onSearch('test');
    expect(pushQueryToLocation).toHaveBeenCalledWith({ q: 'test' }, true);
  });
});
