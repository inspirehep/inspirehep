import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../../fixtures/store';
import SearchLayout from '../SearchLayout';

describe('SearchLayout', () => {
  it('renders with initial state', () => {
    const store = getStore();
    const wrapper = shallow(
      <SearchLayout store={store} renderResultItem={jest.fn()} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with loading states true', () => {
    const store = getStoreWithState(
      fromJS({
        search: {
          loading: true,
          loadingAggregations: true,
        },
      })
    );
    const wrapper = shallow(
      <SearchLayout store={store} renderResultItem={jest.fn()} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without aggregations', () => {
    const store = getStore();
    const wrapper = shallow(
      <SearchLayout
        store={store}
        withoutAggregations
        withoutSort
        renderResultItem={jest.fn()}
      />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
