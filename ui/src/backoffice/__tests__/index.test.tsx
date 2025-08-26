import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { getStore } from '../../fixtures/store';
import Backoffice from '..';
import AuthorsSearchPageContainer from '../authors/search/containers/SearchPageContainer';
import LiteratureSearchPageContainer from '../literature/search/containers/SearchPageContainer';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
  BACKOFFICE,
} from '../../common/routes';
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
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <Backoffice />
        </MemoryRouter>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /backoffice/dashboard', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <Route path={BACKOFFICE} component={DashboardPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('backoffice-dashboard-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/authors/search', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE_AUTHORS_SEARCH]}>
          <Route
            path={BACKOFFICE_AUTHORS_SEARCH}
            component={AuthorsSearchPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/literature/search', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE_LITERATURE_SEARCH]}>
          <Route
            path={BACKOFFICE_LITERATURE_SEARCH}
            component={LiteratureSearchPageContainer}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });
});
