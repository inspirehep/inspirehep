import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import SortByContainer from '../SortByContainer';
import { pushQueryToLocation } from '../../../actions/search';
import SortBy from '../../components/SortBy';

jest.mock('../../../actions/search');

pushQueryToLocation.mockReturnValue(async () => {});

describe('SortByContainer', () => {
  afterEach(() => {
    pushQueryToLocation.mockClear();
  });

  it('passes location query sort param to SortBy', () => {
    const store = getStoreWithState({
      router: { location: { query: { sort: 'mostrecent' } } },
    });
    const wrapper = mount(
      <Provider store={store}>
        <SortByContainer />
      </Provider>
    );
    expect(wrapper.find(SortBy)).toHaveProp({ sort: 'mostrecent' });
  });

  it('dispatches search onSortChange', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <SortByContainer />
      </Provider>
    );
    const onSortChange = wrapper.find(SortBy).prop('onSortChange');
    const sort = 'mostcited';
    onSortChange(sort);
    expect(pushQueryToLocation).toHaveBeenCalledWith({ sort });
  });
});
