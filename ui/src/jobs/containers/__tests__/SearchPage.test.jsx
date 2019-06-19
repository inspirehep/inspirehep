import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import SearchPage from '../SearchPage';

describe('SearchPage', () => {
  it('renders with loading states', () => {
    const store = getStoreWithState(
      fromJS({
        search: {
          loading: true,
          loadingAggregations: true,
        },
      })
    );
    const wrapper = shallow(<SearchPage store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
