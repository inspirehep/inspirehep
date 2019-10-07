import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import AggregationFiltersContainer, {
  dispatchToProps,
} from '../AggregationFiltersContainer';
import { pushQueryToLocation } from '../../../actions/search';
import AggregationFilters from '../../components/AggregationFilters';

jest.mock('../../../actions/search');

describe('AggregationFiltersContainer', () => {
  afterEach(() => {
    pushQueryToLocation.mockClear();
  });

  it('passes search and localtion state', () => {
    const store = getStoreWithState({
      router: { location: { query: { agg1: 'agg1-selected' } } },
      search: fromJS({
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
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AggregationFiltersContainer />
      </Provider>
    );
    const searchState = store.getState().search;
    const locationState = store.getState().router.location;

    expect(wrapper.find(AggregationFilters)).toHaveProp({
      aggregations: searchState.get('aggregations'),
      initialAggregations: searchState.get('initialAggregations'),
      numberOfResults: searchState.get('total'),
      query: locationState.query,
    });
  });

  it('dispatches search onAggregationChange (also resets page selection)', () => {
    const props = dispatchToProps(jest.fn());
    props.onAggregationChange('agg1', ['selected']);
    expect(pushQueryToLocation).toHaveBeenCalledWith({
      agg1: ['selected'],
      page: 1,
    });
  });
});
