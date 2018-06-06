import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import NumberOfResultsContainer from '../NumberOfResultsContainer';

describe('NumberOfResultsContainer', () => {
  it('renders initial state ', () => {
    const store = getStoreWithState({
      search: fromJS({
        total: 5,
      }),
    });
    const wrapper = shallow(<NumberOfResultsContainer store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
