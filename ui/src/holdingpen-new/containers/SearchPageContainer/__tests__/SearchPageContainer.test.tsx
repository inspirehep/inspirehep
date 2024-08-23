import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../../fixtures/store';
import SearchPageContainer from '../SearchPageContainer';
import { HOLDINGPEN_SEARCH_NEW } from '../../../../common/routes';
import {
  HOLDINGPEN_SEARCH_QUERY_UPDATE,
  HOLDINGPEN_SEARCH_REQUEST,
} from '../../../../actions/actionTypes';

describe('SearchPageContainer', () => {
  let store = getStoreWithState({
    holdingpen: fromJS({
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
        <MemoryRouter initialEntries={[HOLDINGPEN_SEARCH_NEW]}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );

  it('renders the SearchPage component', () => {
    const { getByTestId, asFragment } = renderComponent(store);

    const searchPage = getByTestId('holdingpen-search-page');

    expect(searchPage).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should dispatch fetchSearchResults on mount', () => {
    store.clearActions();
    renderComponent(store);

    expect(store.getActions()[0]).toEqual({
      type: HOLDINGPEN_SEARCH_REQUEST,
    });
  });

  it('should dispatch fetchSearchResults when query changes', () => {
    store.clearActions();

    store = getStoreWithState({
      holdingpen: fromJS({
        query: { page: 2, size: 10 },
      }),
    });
    renderComponent(store);

    expect(store.getActions()[0]).toEqual({
      type: HOLDINGPEN_SEARCH_REQUEST,
    });
  });
});
