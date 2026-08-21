import { Route, Routes } from 'react-router-dom';
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
    const { container } = renderWithProviders(
      <Routes>
        <Route path={`${BACKOFFICE}/*`} element={<Backoffice />} />
      </Routes>,
      {
        store,
        route: BACKOFFICE,
      }
    );
    expect(container).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /backoffice/dashboard', () => {
    const { getByTestId } = renderWithProviders(
      <Routes>
        <Route path={`${BACKOFFICE}/*`} element={<DashboardPageContainer />} />
      </Routes>,
      { route: BACKOFFICE }
    );

    expect(getByTestId('backoffice-dashboard-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/authors/search', () => {
    const { getByTestId } = renderWithProviders(
      <Routes>
        <Route
          path={BACKOFFICE_AUTHORS_SEARCH}
          element={<AuthorsSearchPageContainer />}
        />
      </Routes>,
      { route: BACKOFFICE_AUTHORS_SEARCH }
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/literature/search', () => {
    const { getByTestId } = renderWithProviders(
      <Routes>
        <Route
          path={BACKOFFICE_LITERATURE_SEARCH}
          element={<LiteratureSearchPageContainer />}
        />
      </Routes>,
      { route: BACKOFFICE_LITERATURE_SEARCH }
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });

  it('does not show literature search when user is not cataloger or superuser', () => {
    const unauthorizedStore = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
      backoffice: fromJS({
        loggedIn: true,
      }),
    });

    const { queryByTestId } = renderWithProviders(<Backoffice />, {
      store: unauthorizedStore,
      route: BACKOFFICE_LITERATURE_SEARCH,
    });

    expect(queryByTestId('backoffice-search-page')).not.toBeInTheDocument();
  });
});
