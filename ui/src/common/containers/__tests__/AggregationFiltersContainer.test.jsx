import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AggregationFiltersContainer from '../AggregationFiltersContainer';
import AggregationFilters from '../../components/AggregationFilters';
import { LITERATURE_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

jest.mock('../../components/AggregationFilters', () => {
  const actual = jest.requireActual('../../components/AggregationFilters');
  return {
    __esModule: true,
    default: jest.fn(actual.default),
  };
});

describe('AggregationFiltersContainer', () => {
  it('passes namespace search state', () => {
    const searchNamespaceState = {
      query: { agg1: 'agg1-selected' },
      initialAggregations: {
        agg1: {
          buckets: [
            {
              key: 'agg1key',
              doc_count: 1,
            },
          ],
          meta: {
            title: 'Jessica Jones',
            order: 1,
            type: 'checkbox',
          },
        },
      },
      aggregations: {
        agg1: {
          buckets: [
            {
              key: 'agg1key',
              doc_count: 1,
            },
          ],
          meta: {
            title: 'Jessica Jones',
            order: 1,
            type: 'checkbox',
          },
        },
        agg2: {
          buckets: [
            {
              key: 'agg2key',
              doc_count: 2,
            },
          ],
          meta: {
            title: 'Luke Cage',
            order: 2,
            type: 'checkbox',
          },
        },
      },
      total: 2,
    };
    const namespace = LITERATURE_NS;
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: searchNamespaceState,
        },
      }),
    });

    render(
      <Provider store={store}>
        <AggregationFiltersContainer namespace={namespace} />
      </Provider>
    );

    expect(AggregationFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregations: fromJS(searchNamespaceState.aggregations),
        initialAggregations: fromJS(searchNamespaceState.initialAggregations),
        numberOfResults: searchNamespaceState.total,
        query: searchNamespaceState.query,
        namespace,
      }),
      expect.anything()
    );
  });

  it('dispatches SEARCH_QUERY_UPDATE onAggregationChange', () => {
    const namespace = LITERATURE_NS;
    const searchNamespaceState = {
      query: { agg1: 'agg1-selected' },
      initialAggregations: {
        agg1: {
          buckets: [
            {
              key: 'agg1key',
              doc_count: 1,
            },
          ],
          meta: {
            title: 'Jessica Jones',
            order: 1,
            type: 'checkbox',
          },
        },
      },
      aggregations: {
        agg1: {
          buckets: [
            {
              key: 'agg1key',
              doc_count: 1,
            },
          ],
          meta: {
            title: 'Jessica Jones',
            order: 1,
            type: 'checkbox',
          },
        },
        agg2: {
          buckets: [
            {
              key: 'agg2key',
              doc_count: 2,
            },
          ],
          meta: {
            title: 'Luke Cage',
            order: 2,
            type: 'checkbox',
          },
        },
      },
      total: 2,
    };

    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: searchNamespaceState,
        },
      }),
    });

    const screen = render(
      <Provider store={store}>
        <AggregationFiltersContainer namespace={namespace} />
      </Provider>
    );

    fireEvent.click(screen.getByText('agg1key'));

    const expectedActions = [
      searchQueryUpdate(namespace, {
        agg1: ['agg1-selected', 'agg1key'],
        page: '1',
      }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
