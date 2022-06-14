import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import AggregationFiltersContainer from '../AggregationFiltersContainer';
import AggregationFilters from '../../components/AggregationFilters';
import { LITERATURE_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AggregationFiltersContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes namespace search state', () => {
    const searchNamespaceState = {
      query: { agg1: 'agg1-selected' },
      initialAggregations: {
        agg1: {
          buckets: [
            {
              key: 'agg1key',
              doc_count: 1,
            },
          ],
          meta: {
            title: 'Jessica Jones',
            order: 1,
            type: 'checkbox',
          },
        },
      },
      aggregations: {
        agg1: {
          buckets: [
            {
              key: 'agg1key',
              doc_count: 1,
            },
          ],
          meta: {
            title: 'Jessica Jones',
            order: 1,
            type: 'checkbox',
          },
        },
        agg2: {
          buckets: [
            {
              key: 'agg2key',
              doc_count: 2,
            },
          ],
          meta: {
            title: 'Luke Cage',
            order: 2,
            type: 'checkbox',
          },
        },
      },
      total: 2,
    };
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: searchNamespaceState,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AggregationFiltersContainer namespace={namespace} />
      </Provider>
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AggregationFilters)).toHaveProp({
      aggregations: fromJS(searchNamespaceState.aggregations),
      initialAggregations: fromJS(searchNamespaceState.initialAggregations),
      numberOfResults: searchNamespaceState.total,
      query: searchNamespaceState.query,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches SEARCH_QUERY_UPDATE onAggregationChange', () => {
    const namespace = LITERATURE_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <AggregationFiltersContainer namespace={namespace} />
      </Provider>
    );
    const onAggregationChange = wrapper
      .find(AggregationFilters)
      .prop('onAggregationChange');
    onAggregationChange('agg1', ['selected']);
    const expectedActions = [
      searchQueryUpdate(namespace, { agg1: ['selected'], page: '1' }),
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
