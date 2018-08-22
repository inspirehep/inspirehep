import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import AggregationFiltersContainer, {
  dispatchToProps,
} from '../AggregationFiltersContainer/AggregationFiltersContainer';
import * as search from '../../../actions/search';

jest.mock('../../../actions/search');

describe('AggregationFiltersContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { agg1: 'agg1-selected' } } },
      search: fromJS({
        aggregations: {
          agg1: {
            buckets: [{}],
            meta: {
              title: 'Jessica Jones',
              order: 1,
            },
          },
          agg2: {
            buckets: [{}],
            meta: {
              title: 'Luke Cage',
              order: 2,
            },
          },
        },
      }),
    });
    const wrapper = shallow(
      <AggregationFiltersContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render aggregations with empty buckets', () => {
    const store = getStoreWithState({
      search: fromJS({
        aggregations: {
          agg: {
            buckets: [{}],
            meta: {
              title: 'Jessica Jones',
              order: 1,
            },
          },
          emptyAgg: {
            buckets: [],
            meta: {
              title: 'Luke Cage',
              order: 2,
            },
          },
        },
      }),
    });
    const wrapper = shallow(
      <AggregationFiltersContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: test onAggregationChange when range aggregation

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
