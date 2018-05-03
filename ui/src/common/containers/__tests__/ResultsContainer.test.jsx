import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import ResultsContainer from '../ResultsContainer';

describe('ResultsContainer', () => {
  it('renders initial state ', () => {
    const store = getStoreWithState({
      search: fromJS({
        results: [
          {
            id: 1,
            value: 'value1',
          },
          {
            id: 2,
            value: 'value2',
          },
        ],
      }),
    });
    const wrapper = mount((
      <Provider store={store}>
        <ResultsContainer renderItem={result => <span>{result.get('value')}</span>} />
      </Provider>
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
