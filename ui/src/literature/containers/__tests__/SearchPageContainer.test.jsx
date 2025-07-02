import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStore } from '../../../fixtures/store';
import SearchPageContainer from '../SearchPageContainer';

jest.mock('../LiteratureSearchContainer', () => (props) => (
  <div data-testid="literature-search-container">
    Literature Search (numberOfSelected: {props.numberOfSelected})
  </div>
));

jest.mock('../AssignConferencesDrawerContainer', () => () => (
  <div data-testid="assign-conferences-drawer">Assign Conferences Drawer</div>
));

jest.mock(
  '../../../common/components/SearchFeedback/SearchFeedback',
  () => () => <div data-testid="search-feedback">Search Feedback</div>
);

describe('SearchPageContainer Container', () => {
  it('set assignView true if cataloger is logged in and flag is enabled', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
      literature: fromJS({
        literatureSelection: [],
      }),
      search: fromJS({
        namespaces: {
          literature: {
            total: 0,
            error: null,
          },
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('assign-conferences-drawer')).toBeInTheDocument();
    expect(getByTestId('literature-search-container')).toBeInTheDocument();
  });
});
