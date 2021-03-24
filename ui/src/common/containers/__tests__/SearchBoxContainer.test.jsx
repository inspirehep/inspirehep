import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState, mockActionCreator } from '../../../fixtures/store';
import SearchBoxContainer from '../SearchBoxContainer';
import SearchBox from '../../components/SearchBox';
import { searchQueryUpdate } from '../../../actions/search';
import { appendQueryToLocationSearch } from '../../../actions/router';
import { UI_EXCLUDE_SELF_CITATIONS_PARAM } from '../../../literature/containers/ExcludeSelfCitationsContainer';
import { UI_CITATION_SUMMARY_PARAM } from '../../../literature/containers/CitationSummarySwitchContainer';
import { clearLiteratureSelection } from '../../../actions/literature';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);
jest.mock('../../../actions/literature');
mockActionCreator(clearLiteratureSelection);
jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

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

  it('calls SEARCH_QUERY_UPDATE and LITERATURE_SELECTION_CLEAR on search', async () => {
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
      clearLiteratureSelection(),
      searchQueryUpdate(searchBoxNamespace, { q: 'test' }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('resets the ui query params on Search unless literature namespace', async () => {
    const searchBoxNamespace = 'literature';
    const newNamespace = 'authors';
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
    onSearch(newNamespace, 'test');

    const expectedAction = appendQueryToLocationSearch({
      [UI_CITATION_SUMMARY_PARAM]: undefined,
      [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
    });
    expect(store.getActions()).toContainEqual(expectedAction);
  });
});
