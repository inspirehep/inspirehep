import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../../fixtures/store';
import { SEARCH_REQUEST } from '../../../actions/actionTypes';
import AggregationFiltersContainer, {
  dispatchToProps,
} from '../AggregationFiltersContainer/AggregationFiltersContainer';

describe('AggregationFiltersContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { agg1: 'agg1-selected' } } },
      search: fromJS({
        aggregations: {
          agg1: {
            buckets: [{}],
          },
          agg2: {
            buckets: [{}],
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
          },
          emptyAgg: {
            buckets: [],
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
    const store = getStore();
    const props = dispatchToProps(store.dispatch);
    props.onAggregationChange('agg1', ['selected']);
    const actions = store.getActions();
    const expectedAction = actions.find(
      action => action.type === SEARCH_REQUEST
    );
    expect(expectedAction).toBeDefined();
    expect(expectedAction.payload).toEqual({ agg1: ['selected'] });
  });
});
