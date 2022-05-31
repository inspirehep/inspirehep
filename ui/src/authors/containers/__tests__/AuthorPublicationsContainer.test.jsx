import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorPublicationsContainer, {
  AuthorPublications,
} from '../AuthorPublicationsContainer';
import LiteratureSearchContainer from '../../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { initialState } from '../../../reducers/authors';

describe('AuthorPublicationsContainer', () => {
  it('passes all props to LiteratureSearchContainer', () => {
    const store = getStoreWithState({
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionUnclaimed: [],
        publicationSelectionClaimed: [],
        data: {
          metadata: {
            facet_author_name: '1234_ThatDude',
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorPublicationsContainer />
      </Provider>
    );

    expect(wrapper.find(LiteratureSearchContainer)).toHaveProp({
      namespace: AUTHOR_PUBLICATIONS_NS,
      baseQuery: {
        author: ['1234_ThatDude'],
      },
      baseAggregationsQuery: {
        author_recid: '1234_ThatDude',
      },
      numberOfSelected: 0,
    });
  });

  it('set assignView true if cataloger is logged in and flag is enabled', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignView: true,
    });
  });

  // TODO: Remove test case when the flag is not needed anymore
  it('set assignView true if superuser is logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignView: true,
    });
  });

  it('set assignDifferentProfileView when user has a profile', () => {
    global.CONFIG = { ASSIGN_DIFFERENT_PROFILE_UI_FEATURE_FLAG: true };
    const store = getStoreWithState({
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
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignViewDifferentProfile: true,
    });
  });

  it('set assignViewNoProfile when user logged_in', () => {
    global.CONFIG = { ASSIGN_NO_PROFILE_UI_FEATURE_FLAG: true };
    const store = getStoreWithState({
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
      user: fromJS({ loggedIn: true }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignViewNoProfile: true,
    });
  });

  it('set assignViewNoProfile when user logged_in', () => {
    global.CONFIG = { ASSIGN_NOT_LOGGED_IN_FEATURE_FLAG: true };
    const store = getStoreWithState({
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionClaimed: [],
        publicationSelectionUnclaimed: [],
      }),
      user: fromJS({ loggedIn: false }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignViewNotLoggedIn: true,
    });
  });

  it('set correct numberOfSelected when publications are selected', () => {
    const store = getStoreWithState({
      authors: fromJS({
        ...initialState,
        publicationSelection: {
          papersIds: [1234, 12345],
          selected: true
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/authors/123']} initialIndex={0}>
          <AuthorPublicationsContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      numberOfSelected: 2,
    });
  });
});
