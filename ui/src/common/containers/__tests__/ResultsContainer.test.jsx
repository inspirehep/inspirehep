import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import ResultsContainer from '../ResultsContainer';
import SearchResults from '../../components/SearchResults';

describe('ResultsContainer', () => {
  it('passes results from state', () => {
    const results = fromJS([
      {
        id: 1,
        value: 'value1',
      },
      {
        id: 2,
        value: 'value2',
      },
    ]);
    const store = getStoreWithState({
      search: fromJS({
        results,
        scope: {
          query: {
            page: 1,
            size: 25,
          },
        },
      }),
    });
    const renderItem = result => <span>{result.get('value')}</span>;

    const wrapper = mount(
      <Provider store={store}>
        <ResultsContainer renderItem={renderItem} />
      </Provider>
    );
    expect(wrapper.find(SearchResults)).toHaveProp({
      results,
      page: 1,
      pageSize: 25,
      renderItem,
    });
  });
});
