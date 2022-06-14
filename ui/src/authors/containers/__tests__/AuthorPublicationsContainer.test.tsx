import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorPublicationsContainer, {
  AuthorPublications,
} from '../AuthorPublicationsContainer';
import LiteratureSearchContainer from '../../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { initialState } from '../../../reducers/authors';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorPublicationsContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignView: true,
    });
  });

  // TODO: Remove test case when the flag is not needed anymore
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignView: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set assignDifferentProfileView when user has a profile', () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignViewDifferentProfile: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set assignViewNoProfile when user logged_in', () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignViewNoProfile: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set assignViewNoProfile when user logged_in', () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      assignViewNotLoggedIn: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(AuthorPublications)).toHaveProp({
      numberOfSelected: 2,
    });
  });
});
