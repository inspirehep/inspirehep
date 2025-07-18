import React from 'react';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import CitationSummaryTableContainer from '../CitationSummaryTableContainer';
import { renderWithProviders } from '../../../fixtures/render';

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

    const screen = renderWithProviders(
      <CitationSummaryTableContainer />,
      store
    );

    expect(screen.getByText('Citeable')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
  });
});
