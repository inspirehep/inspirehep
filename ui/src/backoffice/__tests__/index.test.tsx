import React from 'react';
import { Route } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import Backoffice from '..';
import AuthorsSearchPageContainer from '../authors/search/containers/SearchPageContainer';
import LiteratureSearchPageContainer from '../literature/search/containers/SearchPageContainer';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
  BACKOFFICE,
} from '../../common/routes';
import DashboardPageContainer from '../dashboard/containers/DashboardPageContainer';
import { WorkflowStatuses, WorkflowTypes } from '../constants';

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
                status: [{ key: WorkflowStatuses.ERROR }],
              },
              {
                key: WorkflowTypes.AUTHOR_UPDATE,
                doc_count: 1,
              },
              {
                key: WorkflowTypes.HEP_CREATE,
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

  it('navigates to SearchPageContainer when /backoffice/authors/search', () => {
    const { getByTestId } = renderWithProviders(
      <Route
        path={BACKOFFICE_AUTHORS_SEARCH}
        component={AuthorsSearchPageContainer}
      />,
      { route: BACKOFFICE_AUTHORS_SEARCH }
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/literature/search', () => {
    const { getByTestId } = renderWithProviders(
      <Route
        path={BACKOFFICE_LITERATURE_SEARCH}
        component={LiteratureSearchPageContainer}
      />,
      { route: BACKOFFICE_LITERATURE_SEARCH }
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });
});
