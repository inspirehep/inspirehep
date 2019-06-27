import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import * as search from '../../../actions/search';
import { getStoreWithState } from '../../../fixtures/store';
import SearchBoxContainer, { dispatchToProps } from '../SearchBoxContainer';
import SearchBox from '../../components/SearchBox';

jest.mock('../../../actions/search');

describe('SearchBoxContainer', () => {
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
    const mockPushQueryToLocation = jest.fn();
    search.pushQueryToLocation = mockPushQueryToLocation;
    const props = dispatchToProps(jest.fn());
    props.onSearch('test');
    expect(mockPushQueryToLocation).toHaveBeenCalledWith({ q: 'test' }, true);
  });
});
