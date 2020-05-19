import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import NumberOfResultsContainer from '../NumberOfResultsContainer';
import NumberOfResults from '../../components/NumberOfResults';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';

describe('NumberOfResultsContainer', () => {
  it('passes search namepspace total state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            total: 5,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <NumberOfResultsContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(NumberOfResults)).toHaveProp({ numberOfResults: 5 });
  });
});
