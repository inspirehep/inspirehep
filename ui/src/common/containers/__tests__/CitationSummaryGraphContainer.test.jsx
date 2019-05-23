import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';
import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryGraphContainer from '../CitationSummaryGraphContainer';
import CitationSummaryGraph from '../../components/CitationSummaryGraph/CitationSummaryGraph';
import {
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
} from '../../../actions/actionTypes';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';

jest.mock('../../../actions/citations');

const mockCitationsStore = fromJS({
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
});
describe('CitationSummaryGraphContainer', () => {
  it('renders with state from store', () => {
    const store = getStoreWithState({
      citations: mockCitationsStore,
    });
    const wrapper = shallow(
      <CitationSummaryGraphContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches fetch author publications and facets with clean query when onSelectBarChange called with null', () => {
    const existingQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      citeable: true,
    };
    const newQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      citation_count: undefined,
      citeable: undefined,
      refereed: undefined,
    };
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: existingQuery,
        },
      }),
    });
    const wrapper = mount(<CitationSummaryGraphContainer store={store} />);
    wrapper.find(CitationSummaryGraph).prop('onSelectBarChange')(null);

    const expectedActions = [
      {
        type: AUTHOR_PUBLICATIONS_REQUEST,
        payload: newQuery,
      },
      {
        type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
        payload: newQuery,
      },
    ];
    const actions = store.getActions().slice(0, 2);
    expect(actions).toEqual(expectedActions);
  });
  it('dispatches fetch author publications and facets with citeable query when onSelectBarChange called with citeable bar', () => {
    const existingQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      citeable: true,
    };
    const newQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      citation_count: '0--0',
      citeable: true,
      refereed: undefined,
    };
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: existingQuery,
        },
      }),
    });
    const wrapper = mount(<CitationSummaryGraphContainer store={store} />);
    wrapper.find(CitationSummaryGraph).prop('onSelectBarChange')({
      xValue: '0--0',
      type: CITEABLE_BAR_TYPE,
    });

    const expectedActions = [
      {
        type: AUTHOR_PUBLICATIONS_REQUEST,
        payload: newQuery,
      },
      {
        type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
        payload: newQuery,
      },
    ];
    const actions = store.getActions().slice(0, 2);
    expect(actions).toEqual(expectedActions);
  });
  it('dispatches fetch author publications and facets with published query when onSelectBarChange called with published bar', () => {
    const existingQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      citeable: true,
    };
    const newQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      citation_count: '0--0',
      citeable: true,
      refereed: true,
    };
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: existingQuery,
        },
      }),
    });
    const wrapper = mount(<CitationSummaryGraphContainer store={store} />);
    wrapper.find(CitationSummaryGraph).prop('onSelectBarChange')({
      xValue: '0--0',
      type: PUBLISHED_BAR_TYPE,
    });

    const expectedActions = [
      {
        type: AUTHOR_PUBLICATIONS_REQUEST,
        payload: newQuery,
      },
      {
        type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
        payload: newQuery,
      },
    ];
    const actions = store.getActions().slice(0, 2);
    expect(actions).toEqual(expectedActions);
  });

  it('renders citeable selected bar', () => {
    const store = getStoreWithState({
      citations: mockCitationsStore,
      authors: fromJS({
        publications: {
          query: { citeable: true, citation_count: '0--0' },
        },
      }),
    });
    const wrapper = shallow(
      <CitationSummaryGraphContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders published selected bar', () => {
    const store = getStoreWithState({
      citations: mockCitationsStore,
      authors: fromJS({
        publications: {
          query: { citeable: true, citation_count: '0--0', refereed: 'true' },
        },
      }),
    });
    const wrapper = shallow(
      <CitationSummaryGraphContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
