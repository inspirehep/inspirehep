import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CiteAllActionContainer from '../CiteAllActionContainer';
import CiteAllAction from '../../components/CiteAllAction';

describe('CiteAllActionContainer', () => {
  it('passes location query without sort and page and number of results', () => {
    const store = getStoreWithState({
      router: {
        location: { query: { sort: 'mostrecent', q: 'query', page: 1 } },
      },
      search: fromJS({ total: 11 }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteAllActionContainer />
      </Provider>
    );
    expect(wrapper.find(CiteAllAction)).toHaveProp({ query: { q: 'query' } });
  });
});
