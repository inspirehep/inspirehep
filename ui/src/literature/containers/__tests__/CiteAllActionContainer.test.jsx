import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CiteAllActionContainer from '../CiteAllActionContainer';
import CiteAllAction from '../../components/CiteAllAction';
import { LITERATURE_NS } from '../../../reducers/search';

describe('CiteAllActionContainer', () => {
  it('passes literature namespace query and number of results', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostcited', q: 'query' },
            total: 11,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteAllActionContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(CiteAllAction)).toHaveProp({
      query: { sort: 'mostcited', q: 'query' },
    });
    expect(wrapper.find(CiteAllAction)).toHaveProp({ numberOfResults: 11 });
  });
});
