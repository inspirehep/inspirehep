import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);
// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/literature');
mockActionCreator(clearLiteratureSelection);
// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SearchBoxContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(SearchBox)).toHaveProp({
      value: 'test',
      namespace: searchBoxNamespace,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toContainEqual(expectedAction);
  });
});
