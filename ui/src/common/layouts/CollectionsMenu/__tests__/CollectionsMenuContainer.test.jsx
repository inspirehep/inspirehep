import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { getStore } from '../../../../fixtures/store';
import CollectionsMenuContainer from '../CollectionsMenuContainer';
import { SUBMISSIONS_AUTHOR } from '../../../routes';

describe('CollectionsMenuContainer', () => {
  it('passes props from state', () => {
    const store = getStore({
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    const collectionsMenu = getByTestId('collections-menu');
    expect(collectionsMenu).toBeInTheDocument();
  });

  it('renders data when user is superuser and logged in', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Data')).toBeInTheDocument();
  });

  it('does not render data when user is normal and logged in', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['normal'],
        },
      }),
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
        },
      },
    });

    const { queryByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(queryByText('Data')).not.toBeInTheDocument();
  });

  it('does not render data by default', () => {
    const store = getStore({
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
        },
      },
    });

    const { queryByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(queryByText('Data')).not.toBeInTheDocument();
  });
});
