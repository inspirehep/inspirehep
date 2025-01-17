import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import { getStore } from '../../../../fixtures/store';
import SearchPageContainer from '../SearchPageContainer';
import { BACKOFFICE_SEARCH } from '../../../../common/routes';

describe('SearchPageContainer', () => {
  const store = getStore({
    backoffice: fromJS({
      loading: false,
      loggedIn: true,
      query: {},
      totalResults: 15,
    }),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (store: any) =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[BACKOFFICE_SEARCH]}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );

  it('renders the SearchPage component', () => {
    const { getByTestId, asFragment } = renderComponent(store);

    const searchPage = getByTestId('backoffice-search-page');

    expect(searchPage).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
