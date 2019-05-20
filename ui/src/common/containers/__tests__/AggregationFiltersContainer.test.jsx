import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import AggregationFiltersContainer, {
  dispatchToProps,
} from '../AggregationFiltersContainer';
import * as search from '../../../actions/search';
import AggregationFilters from '../../components/AggregationFilters';

jest.mock('../../../actions/search');

describe('AggregationFiltersContainer', () => {
  it('passes search and localtion state', () => {
    const store = getStoreWithState({
      router: { location: { query: { agg1: 'agg1-selected' } } },
      search: fromJS({
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
      }),
    });
    const wrapper = mount(<AggregationFiltersContainer store={store} />);
    const dummyWrapper = wrapper.find(AggregationFilters);
    const searchState = store.getState().search;
    const locationState = store.getState().router.location;
    expect(dummyWrapper).toHaveProp(
      'aggregations',
      searchState.get('aggregations')
    );
    expect(dummyWrapper).toHaveProp(
      'numberOfResults',
      searchState.get('total')
    );
    expect(dummyWrapper).toHaveProp('query', locationState.query);
  });

  it('dispatches search onAggregationChange', () => {
    const mockPushQueryToLocation = jest.fn();
    search.pushQueryToLocation = mockPushQueryToLocation;
    const props = dispatchToProps(jest.fn());
    props.onAggregationChange('agg1', ['selected']);
    expect(mockPushQueryToLocation).toHaveBeenCalledWith({
      agg1: ['selected'],
    });
  });
});
