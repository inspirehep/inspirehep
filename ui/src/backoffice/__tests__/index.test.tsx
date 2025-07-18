import React from 'react';
import { Route } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import Backoffice from '..';
import SearchPageContainer from '../search/containers/SearchPageContainer';
import { BACKOFFICE_SEARCH, BACKOFFICE } from '../../common/routes';
import DashboardPageContainer from '../dashboard/containers/DashboardPageContainer';
import { WorkflowTypes } from '../constants';

describe('Backoffice', () => {
  const store = getStore({
    user: fromJS({
      loggedIn: true,
      data: {
        roles: ['cataloger'],
      },
    }),
    backoffice: fromJS({
      loggedIn: true,
      facets: fromJS({
        _filter_workflow_type: fromJS({
          workflow_type: fromJS({
            buckets: fromJS([
              {
                key: WorkflowTypes.AUTHOR_CREATE,
                doc_count: 1,
                status: [{ key: 'error' }],
              },
              {
                key: WorkflowTypes.AUTHOR_UPDATE,
                doc_count: 1,
              },
              {
                key: 'HEP_CREATE',
                doc_count: 1,
              },
            ]),
          }),
        }),
      }),
    }),
  });

  it('renders initial state', () => {
    const { container } = renderWithProviders(<Backoffice />, {
      store,
      route: BACKOFFICE,
    });
    expect(container).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /backoffice/dashboard', () => {
    const { getByTestId } = renderWithProviders(
      <Route path={BACKOFFICE} component={DashboardPageContainer} />,
      { route: BACKOFFICE }
    );

    expect(getByTestId('backoffice-dashboard-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/search', () => {
    const { getByTestId } = renderWithProviders(
      <Route path={BACKOFFICE_SEARCH} component={SearchPageContainer} />,
      { route: BACKOFFICE_SEARCH }
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });
});
