import React from 'react';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(
      <ResultsContainer
        store={store}
        renderItem={result => <span>{result.get('value')}</span>}
      />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
