import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryTableContainer from '../CitationSummaryTableContainer';
import CitationSummaryTable from '../../components/CitationSummaryTable';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CitationSummaryTableContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CitationSummaryTable)).toHaveProp({
      citeableBucket: fromJS({ name: 'citeable' }),
      hIndex: fromJS({ name: 'h-index' }),
      publishedBucket: fromJS({ name: 'published' }),
      loading: false,
      error: null,
    });
  });
});
