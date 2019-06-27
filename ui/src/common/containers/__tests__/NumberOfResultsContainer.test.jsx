import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import NumberOfResultsContainer from '../NumberOfResultsContainer';
import NumberOfResults from '../../components/NumberOfResults';

describe('NumberOfResultsContainer', () => {
  it('passes search total state', () => {
    const store = getStoreWithState({
      search: fromJS({
        total: 5,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <NumberOfResultsContainer />
      </Provider>
    );
    expect(wrapper.find(NumberOfResults)).toHaveProp({ numberOfResults: 5 });
  });
});
