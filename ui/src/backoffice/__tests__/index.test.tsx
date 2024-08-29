import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { getStore, getStoreWithState } from '../../fixtures/store';
import Backoffice from '..';
import DashboardPageContainer from '../containers/DashboardPageContainer/DashboardPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer/DetailPageContainer';
import { BACKOFFICE_SEARCH, BACKOFFICE } from '../../common/routes';

describe('Backoffice', () => {
  const store = getStoreWithState({
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
                key: 'AUTHOR_CREATE',
                doc_count: 1,
                status: [{ key: 'error' }],
              },
              {
                key: 'AUTHOR_UPDATE',
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

  it('navigates to DetailPageContainer when /backoffice/:id', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/:id`]}>
          <Route path={`${BACKOFFICE}/:id`} component={DetailPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('backoffice-detail-page')).toBeInTheDocument();
  });

  it('navigates to SearchPageContainer when /backoffice/search', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE_SEARCH]}>
          <Route path={BACKOFFICE_SEARCH} component={SearchPageContainer} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('backoffice-search-page')).toBeInTheDocument();
  });
});
