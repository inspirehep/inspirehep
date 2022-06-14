import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import EmbeddedSearchBoxContainer from '../EmbeddedSearchBoxContainer';
import { ASSIGN_AUTHOR_NS } from '../../../search/constants';

import { searchQueryUpdate } from '../../../actions/search';
import EmbeddedSearchBox from '../../components/EmbeddedSearchBox';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EmbeddedSearchBoxContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
