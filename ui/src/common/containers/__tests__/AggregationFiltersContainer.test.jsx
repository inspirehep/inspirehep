import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import AggregationFiltersContainer from '../AggregationFiltersContainer';
import AggregationFilters from '../../components/AggregationFilters';
import { LITERATURE_NS } from '../../../reducers/search';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';

describe('AggregationFiltersContainer', () => {
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

    expect(wrapper.find(AggregationFilters)).toHaveProp({
      aggregations: fromJS(searchNamespaceState.aggregations),
      initialAggregations: fromJS(searchNamespaceState.initialAggregations),
      numberOfResults: searchNamespaceState.total,
      query: searchNamespaceState.query,
    });
  });

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
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace,
          query: { agg1: ['selected'], page: '1' },
        },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
