import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryGraphContainer from '../CitationSummaryGraphContainer';

jest.mock('../../../actions/citations');

describe('CitationSummaryGraphContainer', () => {
  it('renders with state from store', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationSummary: false,
        errorCitationSummary: null,
        citationSummary: {
          doc_count: 30,
          'h-index': {
            value: {
              all: 8,
              published: 9,
            },
          },
          citations: {
            buckets: {
              all: {
                doc_count: 29,
                citations_count: {
                  value: 2,
                },
                citation_buckets: {
                  buckets: [
                    {
                      key: '0.0-1.0',
                      from: 0,
                      to: 1,
                      doc_count: 1,
                    },
                    {
                      key: '1.0-50.0',
                      from: 1,
                      to: 50,
                      doc_count: 2,
                    },
                    {
                      key: '50.0-250.0',
                      from: 50,
                      to: 250,
                      doc_count: 3,
                    },
                    {
                      key: '250.0-500.0',
                      from: 250,
                      to: 500,
                      doc_count: 4,
                    },
                    {
                      key: '500.0-*',
                      from: 500,
                      doc_count: 0,
                    },
                  ],
                },
                average_citations: {
                  value: 4.12345,
                },
              },
              published: {
                doc_count: 0,
                citations_count: {
                  value: 20,
                },
                citation_buckets: {
                  buckets: [
                    {
                      key: '0.0-1.0',
                      from: 0,
                      to: 1,
                      doc_count: 1,
                    },
                    {
                      key: '1.0-50.0',
                      from: 1,
                      to: 50,
                      doc_count: 2,
                    },
                    {
                      key: '50.0-250.0',
                      from: 50,
                      to: 250,
                      doc_count: 3,
                    },
                    {
                      key: '250.0-500.0',
                      from: 250,
                      to: 500,
                      doc_count: 4,
                    },
                    {
                      key: '500.0-*',
                      from: 500,
                      doc_count: 0,
                    },
                  ],
                },
                average_citations: {
                  value: 9,
                },
              },
            },
          },
        },
      }),
    });
    const wrapper = shallow(
      <CitationSummaryGraphContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
