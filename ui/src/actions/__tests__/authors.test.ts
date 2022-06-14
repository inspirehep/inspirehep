import MockAdapter from 'axios-mock-adapter';
import { fromJS, Set } from 'immutable';
import { advanceTo, clear } from 'jest-date-mock';

import { getStore, mockActionCreator } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_PUBLICATION_CLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
} from '../actionTypes';
import fetchAuthor, {
  setPublicationSelection,
  clearPublicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
  assignOwnPapers,
  setPublicationsClaimedSelection,
  clearPublicationsClaimedSelection,
  clearPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
  clearPublicationsCanNotClaimSelection,
  assignDifferentProfileClaimedPapers,
  assignDifferentProfileUnclaimedPapers,
} from '../authors';
import { searchQueryUpdate } from '../search';
import {
  assignError,
  assignSuccess,
  assigning,
  unassignSuccessOwnProfile,
  assignSuccessOwnProfile,
  assignSuccessDifferentProfileClaimedPapers,
  assignSuccessDifferentProfileUnclaimedPapers,
} from '../../authors/assignNotification';

import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../authors/assignNotification');
// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../search');
mockActionCreator(searchQueryUpdate);

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AUTHOR - async action creators', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fetch author', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      mockHttp.reset();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates AUTHOR_SUCCESS', async (done: $TSFixMe) => {
      mockHttp.onGet('/authors/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        { type: AUTHOR_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates AUTHOR_ERROR', async (done: $TSFixMe) => {
      mockHttp.onGet('/authors/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        {
          type: AUTHOR_ERROR,
          payload: {
            error: {
              message: 'Error',
              status: 500,
            },
          },
          meta: { redirectableError: true },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('select publication', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('setPublicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_SET,
          payload: { publicationIds: [1, 2], selected: true },
        },
      ];

      const store = getStore();
      store.dispatch(setPublicationSelection([1, 2], true));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('setPublicationClaimedSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_CLAIM_SELECTION,
          payload: {
            papersIds: [1, 2],
            selected: true,
          },
        },
      ];

      const store = getStore();
      store.dispatch(setPublicationsClaimedSelection([1, 2], true));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('setPublicationsCanNotClaimSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
          payload: {
            papersIds: [1, 2],
            selected: true,
          },
        },
      ];

      const store = getStore();
      store.dispatch(setPublicationsCanNotClaimSelection([1, 2], true));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('clearPublicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearPublicationSelection());
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('clearPublicationsClaimedSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearPublicationsClaimedSelection());
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clearPublicationsCanNotClaimSelection', () => {
    const expectedActions = [
      {
        type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
      },
    ];

    const store = getStore();
    store.dispatch(clearPublicationsCanNotClaimSelection());
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('assignPapers', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      clear();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful with stub author', async () => {
      const stubAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2, 3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(200, { stub_author_id: stubAuthorId });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        setAssignDrawerVisibility(false),
      ];

      const dispatchPromise = store.dispatch(
        assignPapers({ from: fromAuthorId })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignSuccess).toHaveBeenCalledWith({
        from: fromAuthorId,
        to: stubAuthorId,
        papers: Set(publicationSelection),
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful without stub author', async () => {
      const toAuthorId = 321;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2, 3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(200, {});

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        setAssignDrawerVisibility(false),
      ];

      const dispatchPromise = store.dispatch(
        assignPapers({ from: fromAuthorId, to: toAuthorId })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignSuccess).toHaveBeenCalledWith({
        from: fromAuthorId,
        to: toAuthorId,
        papers: Set(publicationSelection),
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('error', async () => {
      const toAuthorId = 321;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2, 3];

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(500, {});

      const expectedActions: $TSFixMe = [];

      const dispatchPromise = store.dispatch(
        assignPapers({ from: fromAuthorId, to: toAuthorId })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignError).toHaveBeenCalled();
    });
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('assignOwnPapers when assigning to own profile', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      clear();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful', async () => {
      const stubAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2, 3];
      const publicationSelectionClaimed = [1, 2];
      const publicationSelectionUnclaimed = [3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
          publicationSelectionClaimed: Set(publicationSelectionClaimed),
          publicationSelectionUnclaimed: Set(publicationSelectionUnclaimed),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(200, { stub_author_id: stubAuthorId });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsClaimedSelection(),
        clearPublicationsUnclaimedSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignOwnPapers({ from: fromAuthorId, isUnassignAction: false })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignSuccessOwnProfile).toHaveBeenCalledWith({
        numberOfClaimedPapers: 2,
        numberOfUnclaimedPapers: 1,
      });
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('assignOwnPapers when unassigning own profile', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      clear();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful', async () => {
      const stubAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2, 3];
      const publicationSelectionClaimed: $TSFixMe = [];
      const publicationSelectionUnclaimed = [1, 2, 3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
          publicationSelectionClaimed: Set(publicationSelectionClaimed),
          publicationSelectionUnclaimed: Set(publicationSelectionUnclaimed),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(200, { stub_author_id: stubAuthorId });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsClaimedSelection(),
        clearPublicationsUnclaimedSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignOwnPapers({ from: fromAuthorId, isUnassignAction: true })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(unassignSuccessOwnProfile).toHaveBeenCalled();
    });
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('assignDifferentProfileClaimedPapers', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      clear();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful', async () => {
      const toAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelectionClaimed = [1, 2];
      const publicationSelectionCanNotClaim = [3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelectionClaimed: Set(publicationSelectionClaimed),
          publicationSelectionCanNotClaim: Set(publicationSelectionCanNotClaim),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          papers_ids_already_claimed: publicationSelectionClaimed,
          papers_ids_not_matching_name: publicationSelectionCanNotClaim,
        })
        .replyOnce(200, { created_rt_ticket: true });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsClaimedSelection(),
        clearPublicationsCanNotClaimSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignDifferentProfileClaimedPapers({
          from: fromAuthorId,
          to: toAuthorId,
        })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignSuccessDifferentProfileClaimedPapers).toHaveBeenCalled();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful for stub from author', async () => {
      const toAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelectionClaimed = [1, 2];
      const publicationSelectionCanNotClaim = [3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelectionClaimed: Set(publicationSelectionClaimed),
          publicationSelectionCanNotClaim: Set(publicationSelectionCanNotClaim),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          papers_ids_already_claimed: publicationSelectionClaimed,
          papers_ids_not_matching_name: publicationSelectionCanNotClaim,
        })
        .replyOnce(200, {});

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsClaimedSelection(),
        clearPublicationsCanNotClaimSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignDifferentProfileClaimedPapers({
          from: fromAuthorId,
          to: toAuthorId,
        })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignSuccessDifferentProfileUnclaimedPapers).toHaveBeenCalled();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('assignDifferentProfileUnclaimedPapers', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      clear();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('successful', async () => {
      const toAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelectionUnclaimed = [1, 2];
      const publicationSelectionClaimed: $TSFixMe = [];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelectionUnclaimed: Set(publicationSelectionUnclaimed),
          publicationSelectionClaimed: Set(publicationSelectionClaimed),
        }),
      });

      mockHttp
        .onPost('/assign/author', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_recids: publicationSelectionUnclaimed,
        })
        .replyOnce(200);

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsUnclaimedSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignDifferentProfileUnclaimedPapers({
          from: fromAuthorId,
          to: toAuthorId,
        })
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(assignSuccessDifferentProfileUnclaimedPapers).toHaveBeenCalled();
    });
  });
});
