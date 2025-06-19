import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import CitationSummaryGraphContainer from '../CitationSummaryGraphContainer';
import CitationSummaryGraph from '../../components/CitationSummaryGraph/CitationSummaryGraph';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';
import { EXCLUDE_SELF_CITATIONS_PREFERENCE } from '../../../reducers/user';

jest.mock('../../../actions/citations');

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

jest.mock('../../components/CitationSummaryGraph/CitationSummaryGraph', () => {
  const MockCitationSummaryGraph = jest.fn(() => null);
  return MockCitationSummaryGraph;
});

const mockCiteableData = [
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
];
const mockPublishedData = [
  {
    key: '0.0-1.0',
    from: 0,
    to: 1,
    doc_count: 10,
  },
  {
    key: '1.0-50.0',
    from: 1,
    to: 50,
    doc_count: 20,
  },
  {
    key: '50.0-250.0',
    from: 50,
    to: 250,
    doc_count: 30,
  },
  {
    key: '250.0-500.0',
    from: 250,
    to: 500,
    doc_count: 40,
  },
  {
    key: '500.0-*',
    from: 500,
    doc_count: 50,
  },
];
const mockLoading = false;
const mockError = null;
const mockCitationsState = fromJS({
  loadingCitationSummary: mockLoading,
  errorCitationSummary: mockError,
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
            buckets: mockCiteableData,
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
            buckets: mockPublishedData,
          },
          average_citations: {
            value: 9,
          },
        },
      },
    },
  },
});

describe('CitationSummaryGraphContainer', () => {
  it('passes props from state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      citations: mockCitationsState,
      user: fromJS({
        preferences: {
          [EXCLUDE_SELF_CITATIONS_PREFERENCE]: true,
        },
      }),
    });

    render(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );

    expect(CitationSummaryGraph).toHaveBeenCalledWith(
      expect.objectContaining({
        citeableData: mockCiteableData,
        publishedData: mockPublishedData,
        error: mockError,
        loading: mockLoading,
        selectedBar: null,
        excludeSelfCitations: true,
      }),
      expect.any(Object)
    );
  });

  it('sets selectedBar prop from author publications namespace state for a citable bar', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      citations: mockCitationsState,
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { citeable: true, citation_count: '500--250' },
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );

    expect(CitationSummaryGraph).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedBar: {
          type: 'citeable',
          xValue: '500--250',
        },
      }),
      expect.any(Object)
    );
  });

  it('sets selectedBar prop from author publications namespace state for a published bar', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      citations: mockCitationsState,
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { citeable: true, citation_count: '0--0', refereed: 'true' },
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );

    expect(CitationSummaryGraph).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedBar: {
          type: 'published',
          xValue: '0--0',
        },
      }),
      expect.any(Object)
    );
  });
});
