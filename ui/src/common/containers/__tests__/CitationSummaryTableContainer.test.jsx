import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import CitationSummaryTableContainer from '../CitationSummaryTableContainer';

describe('CitationSummaryTableContainer', () => {
  it('pass props from state', () => {
    const store = getStore({
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

    const screen = render(
      <Provider store={store}>
        <CitationSummaryTableContainer />
      </Provider>
    );

    expect(screen.getByText('Citeable')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
  });
});
