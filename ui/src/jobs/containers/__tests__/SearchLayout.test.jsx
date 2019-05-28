import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import SearchLayout from '../SearchLayout';

describe('SearchLayout', () => {
  it('renders with initial state', () => {
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
});
