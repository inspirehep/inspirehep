import React from 'react';
import { mount } from 'enzyme';
import { fromJS, Set } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import NumberOfResultsWithSelectedItemsNumberContainer from '../NumberOfResultsWithSelectedItemsNumberContainer';
import NumberOfResultsWithSelectedItemsNumber from '../../components/NumberOfResultsWithSelectedItemsNumber';
import NumberOfResults from '../../../common/components/NumberOfResults';
import { LITERATURE_NS } from '../../../search/constants';

describe('NumberOfResultsWithSelectedItemsNumberContainer', () => {
  it('passes search namepspace total state and number of selected', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            total: 5,
          },
        },
      }),
      literature: fromJS({
        literatureSelection: Set([1, 2, 3]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <NumberOfResultsWithSelectedItemsNumberContainer
          namespace={namespace}
        />
      </Provider>
    );
    expect(wrapper.find(NumberOfResults)).toHaveProp({ numberOfResults: 5 });
    expect(wrapper.find(NumberOfResultsWithSelectedItemsNumber)).toHaveProp({
      numberOfSelected: 3,
    });
  });

  it('passes search namepspace total state and with 0 number of Selected', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            total: 5,
          },
        },
      }),
      literature: fromJS({
        literatureSelection: Set([]),
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <NumberOfResultsWithSelectedItemsNumberContainer
          namespace={namespace}
        />
      </Provider>
    );
    expect(wrapper.find(NumberOfResults)).toHaveProp({ numberOfResults: 5 });
    expect(wrapper.find(NumberOfResultsWithSelectedItemsNumber)).toHaveProp({
      numberOfSelected: 0,
    });
  });
});
