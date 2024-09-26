import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryTableContainer from '../CitationSummaryTableContainer';
import CitationSummaryTable from '../../components/CitationSummaryTable';

describe('CitationSummaryTableContainer', () => {
  it('pass props from state', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationSummary: false,
        errorCitationSummary: null,
        citationSummary: {
          citations: {
            buckets: {
              all: { name: 'citeable' },
              published: { name: 'published' },
            },
          },
          'h-index': {
            value: { name: 'h-index' },
          },
        },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryTableContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryTable)).toHaveProp({
      citeableBucket: fromJS({ name: 'citeable' }),
      hIndex: fromJS({ name: 'h-index' }),
      publishedBucket: fromJS({ name: 'published' }),
      loading: false,
      error: null,
    });
  });
});
