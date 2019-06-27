import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import CitationsByYearGraphContainer from '../CitationsByYearGraphContainer';
import CitationsByYearGraph from '../../components/CitationsByYearGraph';

describe('CitationsByYearGraphContainer', () => {
  it('pass props from state', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationsByYear: false,
        errorCitationsByYear: null,
        byYear: {
          '1999': 134,
          '2002': 125,
        },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationsByYearGraphContainer />
      </Provider>
    );

    const dummyWrapper = wrapper.find(CitationsByYearGraph);

    expect(dummyWrapper).toHaveProp({
      citationsByYear: {
        '1999': 134,
        '2002': 125,
      },
      error: null,
      loading: false,
    });
  });
});
