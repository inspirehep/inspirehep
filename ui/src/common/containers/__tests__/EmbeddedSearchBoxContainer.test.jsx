import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import EmbeddedSearchBoxContainer from '../EmbeddedSearchBoxContainer';
import { ASSIGN_AUTHOR_NS } from '../../../search/constants';

import { searchQueryUpdate } from '../../../actions/search';
import EmbeddedSearchBox from '../../components/EmbeddedSearchBox';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('EmbeddedSearchBoxContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE on search', () => {
    const store = getStore();
    const namespace = ASSIGN_AUTHOR_NS;
    const wrapper = mount(
      <Provider store={store}>
        <EmbeddedSearchBoxContainer namespace={ASSIGN_AUTHOR_NS} />
      </Provider>
    );
    const onSearch = wrapper.find(EmbeddedSearchBox).prop('onSearch');
    const q = 'test';
    onSearch(q);
    const expectedActions = [searchQueryUpdate(namespace, { q })];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
