import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import SortByContainer from '../SortByContainer';
import SortBy from '../../components/SortBy';
import { LITERATURE_NS } from '../../../search/constants';

import { searchQueryUpdate } from '../../../actions/search';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SortByContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes namespace query sort param to SortBy', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostrecent' },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SortByContainer namespace={namespace} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(SortBy)).toHaveProp({ sort: 'mostrecent' });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches SEARCH_QUERY_UPDATE on sort change', () => {
    const store = getStore();
    const namespace = LITERATURE_NS;
    const wrapper = mount(
      <Provider store={store}>
        <SortByContainer namespace={namespace} />
      </Provider>
    );
    const onSortChange = wrapper.find(SortBy).prop('onSortChange');
    const sort = 'mostcited';
    onSortChange(sort);
    const expectedActions = [searchQueryUpdate(namespace, { sort, page: '1' })];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
