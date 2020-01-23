import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import CitationSummaryGraphContainer from '../CitationSummaryGraphContainer';
import CitationSummaryGraph from '../../components/CitationSummaryGraph/CitationSummaryGraph';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';
import { AUTHOR_PUBLICATIONS_NS } from '../../../reducers/search';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';

jest.mock('../../../actions/citations');

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
    const store = getStoreWithState({
      citations: mockCitationsState,
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryGraph)).toHaveProp({
      citeableData: mockCiteableData,
      publishedData: mockPublishedData,
      error: mockError,
      loading: mockLoading,
      selectedBar: null,
    });
  });

  it('dispatches SEARCH_QUERY_UPDATE for author publication namespace with clean query when onSelectBarChange called with null', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );
    const onSelectBarChange = wrapper
      .find(CitationSummaryGraph)
      .prop('onSelectBarChange');
    onSelectBarChange(null);

    const query = {
      citation_count: undefined,
      citeable: undefined,
      refereed: undefined,
      page: '1',
    };
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace, query },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE for author publication namespace with citeable query when onSelectBarChange called with citeable bar', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );
    wrapper.find(CitationSummaryGraph).prop('onSelectBarChange')({
      xValue: '0--0',
      type: CITEABLE_BAR_TYPE,
    });
    const query = {
      citation_count: '0--0',
      citeable: true,
      refereed: undefined,
      page: '1',
    };
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace: AUTHOR_PUBLICATIONS_NS, query },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE for author publication namespace with published query when onSelectBarChange called with published bar', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );
    wrapper.find(CitationSummaryGraph).prop('onSelectBarChange')({
      xValue: '0--0',
      type: PUBLISHED_BAR_TYPE,
    });
    const query = {
      citation_count: '0--0',
      citeable: true,
      refereed: true,
      page: '1',
    };
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace: AUTHOR_PUBLICATIONS_NS, query },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sets selectedBar prop from author publications namespace state for a citable bar', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      citations: mockCitationsState,
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { citeable: true, citation_count: '500--250' },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryGraph)).toHaveProp({
      selectedBar: {
        type: 'citeable',
        xValue: '500--250',
      },
    });
  });

  it('sets selectedBar prop from author publications namespace state for a published bar', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      citations: mockCitationsState,
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { citeable: true, citation_count: '0--0', refereed: 'true' },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryGraphContainer namespace={namespace} />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryGraph)).toHaveProp({
      selectedBar: {
        type: 'published',
        xValue: '0--0',
      },
    });
  });
});
