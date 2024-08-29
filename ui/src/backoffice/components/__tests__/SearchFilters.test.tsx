import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS, Map } from 'immutable';

import SearchFilters from '../SearchFilters';
import { getStoreWithState } from '../../../fixtures/store';
import { BACKOFFICE, BACKOFFICE_SEARCH } from '../../../common/routes';
import {
  BACKOFFICE_SEARCH_QUERY_RESET,
  BACKOFFICE_SEARCH_QUERY_UPDATE,
} from '../../../actions/actionTypes';

describe('SearchFilters', () => {
  let store = getStoreWithState({
    backoffice: fromJS({
      loading: false,
      loggedIn: true,
      query: {},
      facets: fromJS({
        _filter_workflow_type: fromJS({
          workflow_type: fromJS({
            buckets: fromJS([
              {
                key: 'AUTHOR_CREATE',
                doc_count: 3,
                status: [{ key: 'error' }],
              },
              {
                key: 'AUTHOR_UPDATE',
                doc_count: 7,
              },
              {
                key: 'HEP_CREATE',
                doc_count: 5,
              },
            ]),
          }),
        }),
        _filter_status: fromJS({
          doc_count: 45,
          status: fromJS({
            buckets: fromJS([
              {
                key: 'approval',
                doc_count: 16,
              },
              {
                key: 'completed',
                doc_count: 9,
              },
              {
                key: 'error',
                doc_count: 16,
              },
              {
                key: 'running',
                doc_count: 4,
              },
            ]),
          }),
        }),
      }),
      totalResults: 15,
    }),
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[BACKOFFICE_SEARCH]}>
          <SearchFilters />
        </MemoryRouter>
      </Provider>
    );

  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Results per page')).toBeInTheDocument();
    expect(screen.getByText('Sort by')).toBeInTheDocument();
    expect(screen.getByText('Filter by collection')).toBeInTheDocument();
    expect(screen.getByText('Filter by status')).toBeInTheDocument();
  });

  it('dispatches searchQueryUpdate with correct filters when selecting a collection', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('new authors'));

    const expectedAction = {
      type: BACKOFFICE_SEARCH_QUERY_UPDATE,
      payload: {
        page: 1,
        workflow_type: 'AUTHOR_CREATE',
      },
    };

    await waitFor(() =>
      expect(store.getActions()[store.getActions().length - 1]).toEqual(
        expectedAction
      )
    );
  });

  it('dispatches searchQueryUpdate with correct filters when selecting a status', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('error'));

    const expectedAction = {
      type: BACKOFFICE_SEARCH_QUERY_UPDATE,
      payload: {
        page: 1,
        status: 'error',
      },
    };

    await waitFor(() =>
      expect(store.getActions()[store.getActions().length - 1]).toEqual(
        expectedAction
      )
    );
  });

  it('dispatches searchQueryReset and resets filters when clicking Reset filters', async () => {
    renderComponent();

    await waitFor(() => fireEvent.click(screen.getByText('Reset filters')));

    const expectedAction = {
      type: BACKOFFICE_SEARCH_QUERY_RESET,
    };

    await waitFor(() =>
      expect(store.getActions()[store.getActions().length - 1]).toEqual(
        expectedAction
      )
    );
  });

  it('shows the correct number of results per filter option', () => {
    renderComponent();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders no filter options if facets have no data', () => {
    store = getStoreWithState({
      backoffice: Map({
        loading: false,
        query: Map({
          size: 10,
          ordering: '-_updated_at',
        }),
        facets: Map(),
        totalResults: 0,
      }),
    });

    renderComponent();

    expect(screen.queryByText('Filter by collection')).toBeNull();
    expect(screen.queryByText('Filter by status')).toBeNull();
  });

  it('should render loading state when loading prop is true', () => {
    store = getStoreWithState({
      backoffice: fromJS({
        loading: true,
        loggedIn: true,
        facets: fromJS({}),
        query: fromJS({ page: 1, size: 10 }),
        totalResults: 0,
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <SearchFilters />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });
});
