import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import { getStore } from '../../../../fixtures/store';
import DashboardPageContainer from '../DashboardPageContainer';
import { BACKOFFICE } from '../../../../common/routes';
import { BACKOFFICE_LOGIN_CHECK } from '../../../../actions/actionTypes';
import { WorkflowTypes } from '../../../constants';
import { renderWithProviders } from '../../../../fixtures/render';

describe('DashboardPageContainer', () => {
  let store = getStore({
    backoffice: fromJS({
      loading: false,
      loggedIn: true,
      query: {},
      facets: fromJS({
        _filter_workflow_type: fromJS({
          workflow_type: fromJS({
            buckets: fromJS([
              {
                key: WorkflowTypes.AUTHOR_CREATE,
                doc_count: 3,
                status: [{ key: 'error' }],
              },
              {
                key: WorkflowTypes.AUTHOR_UPDATE,
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    renderWithProviders(<DashboardPageContainer />, {
      store,
      route: BACKOFFICE,
    });

  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByTestId('backoffice-dashboard-page')).toBeInTheDocument();
  });

  it('renders the correct UI elements', () => {
    renderComponent();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Search Backoffice')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('dispatches isUserLoggedInToBackoffice on mount', () => {
    renderComponent();

    expect(store.getActions()[0]).toEqual({
      type: BACKOFFICE_LOGIN_CHECK,
    });
    expect(store.getActions()[1]).toEqual({
      type: BACKOFFICE_LOGIN_CHECK,
    });
  });

  it('handles View all link click', async () => {
    renderComponent();

    const viewAllLink = screen.getByTestId('view-all');

    store.clearActions();

    await waitFor(() => fireEvent.click(viewAllLink));
  });

  it('shows loading spinner when loading is true', () => {
    store = getStore({
      backoffice: fromJS({
        loading: true,
      }),
    });

    renderComponent();

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });
});
