import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { getStore } from '../../../fixtures/store';
import { renderWithProviders } from '../../../fixtures/render';
import SearchPageContainer from '../SearchPageContainer';
import { LITERATURE_NS } from '../../../search/constants';

vi.mock('../LiteratureSearchContainer', () => ({
  default: function MockLiteratureSearchContainer(props) {
    return (
      <div data-testid="literature-search-container">
        <div data-testid="assign-view-context">{String(props.assignView)}</div>
        <div data-testid="number-of-selected">{props.numberOfSelected}</div>
      </div>
    );
  },
}));

vi.mock('../AssignConferencesDrawerContainer', () => ({
  default: function MockAssignConferencesDrawerContainer() {
    return <div data-testid="assign-conferences-drawer" />;
  },
}));

vi.mock('../ToolActionContainer', () => ({
  default: function MockToolActionContainer() {
    return <div data-testid="tool-action-container" />;
  },
}));

describe('SearchPageContainer Container', () => {
  it('renders with assignView true when cataloger is logged in', () => {
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
          [LITERATURE_NS]: {
            total: 0,
            error: null,
          },
        },
      }),
    });

    renderWithProviders(<SearchPageContainer />, { store });

    expect(screen.getByTestId('assign-conferences-drawer')).toBeInTheDocument();
    expect(
      screen.getByTestId('literature-search-container')
    ).toBeInTheDocument();
  });

  it('renders without assignView when regular user is logged in', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
      literature: fromJS({
        literatureSelection: [],
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            total: 0,
            error: null,
          },
        },
      }),
    });

    renderWithProviders(<SearchPageContainer />, { store });

    expect(
      screen.queryByTestId('assign-conferences-drawer')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('literature-search-container')
    ).toBeInTheDocument();
  });

  it('renders error message when search query is invalid', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
      literature: fromJS({
        literatureSelection: [],
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            total: 0,
            error: fromJS({
              message: 'The syntax of the search query is invalid.',
            }),
          },
        },
      }),
    });

    renderWithProviders(<SearchPageContainer />, { store });

    expect(
      screen.getByText('The search query is malformed')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('literature-search-container')
    ).not.toBeInTheDocument();
  });
});
