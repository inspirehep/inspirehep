import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import { getStore } from '../../../fixtures/store';
import AuthorPublicationsContainer from '../AuthorPublicationsContainer';
import AuthorPublications from '../../components/AuthorPublications';
import { initialState } from '../../../reducers/authors';

jest.mock('../../components/AuthorPublications', () =>
  jest.fn(() => <div data-testid="author-publications" />)
);

describe('AuthorPublicationsContainer with AuthorPublications mocked', () => {
  it('set assignView true if cataloger is logged in and flag is enabled', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(AuthorPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        assignView: true,
      }),
      {}
    );
  });

  it('set assignView true if superuser is logged in', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(AuthorPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        assignView: true,
      }),
      {}
    );
  });

  it('set assignDifferentProfileView when user has a profile', () => {
    const store = getStore({
      user: fromJS({
        data: { recid: 3 },
      }),
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionUnclaimed: [],
        publicationSelectionClaimed: [],
        publicationSelectionCanNotClaim: [],
        data: {
          metadata: {
            can_edit: true,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(AuthorPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        assignViewDifferentProfile: true,
      }),
      {}
    );
  });

  it('set assignViewNoProfile when user logged_in', () => {
    const store = getStore({
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
      user: fromJS({ loggedIn: true }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(AuthorPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        assignViewNoProfile: true,
      }),
      {}
    );
  });

  it('set assignViewNoProfile when user logged_in', () => {
    const store = getStore({
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
      user: fromJS({ loggedIn: false }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(AuthorPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        assignViewNotLoggedIn: true,
      }),
      {}
    );
  });

  it('set correct numberOfSelected when publications are selected', () => {
    const store = getStore({
      authors: fromJS({
        ...initialState,
        publicationSelection: {
          papersIds: [1234, 12345],
          selected: true,
        },
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(AuthorPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        numberOfSelected: 2,
      }),
      {}
    );
  });
});
