import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CiteAllActionContainer from '../CiteAllActionContainer';
import CiteAllAction from '../../components/CiteAllAction';
import { searchScopes } from '../../../reducers/search';

describe('CiteAllActionContainer', () => {
  it('passes location query without size and page and number of results', () => {
    const store = getStoreWithState({
      router: {
        location: {
          query: { sort: 'mostcited', q: 'query', page: 1, size: 1 },
        },
      },
      search: fromJS({
        total: 11,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteAllActionContainer />
      </Provider>
    );
    expect(wrapper.find(CiteAllAction)).toHaveProp({
      query: { q: 'query', sort: 'mostcited' },
    });
    expect(wrapper.find(CiteAllAction)).toHaveProp({ numberOfResults: 11 });
  });

  it('takes default sort when sort not given', () => {
    const store = getStoreWithState({
      router: {
        location: { query: { q: 'query', page: 1, size: 1 } },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteAllActionContainer />
      </Provider>
    );
    expect(wrapper.find(CiteAllAction)).toHaveProp({
      query: {
        q: 'query',
        sort: searchScopes.getIn(['literature', 'query', 'sort']),
      },
    });
  });
});
