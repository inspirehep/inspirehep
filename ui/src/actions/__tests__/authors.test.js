import MockAdapter from 'axios-mock-adapter';
import { fromJS, Set } from 'immutable';
import { advanceTo, clear } from 'jest-date-mock';

import { getStore, mockActionCreator } from '../../fixtures/store';
import http from '../../common/http.ts';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_PUBLICATION_CLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
} from '../actionTypes';
import fetchAuthor, {
  setPublicationSelection,
  clearPublicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
  assignOwnPapers,
  unassignOwnPapers,
  setPublicationsClaimedSelection,
  clearPublicationsClaimedSelection,
  clearPublicationsUnclaimedSelection,
  assignDifferentProfile,
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

jest.mock('../../authors/assignNotification');
jest.mock('../search');
mockActionCreator(searchQueryUpdate);

const mockHttp = new MockAdapter(http.httpClient);

describe('AUTHOR - async action creators', () => {
  describe('fetch author', () => {
    afterEach(() => {
      mockHttp.reset();
    });

    it('creates AUTHOR_SUCCESS', async (done) => {
      mockHttp.onGet('/authors/123').replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: AUTHOR_REQUEST, payload: { recordId: 123 } },
        { type: AUTHOR_SUCCESS, payload: { foo: 'bar' } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor(123));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates AUTHOR_ERROR', async (done) => {
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
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('select publication', () => {
    it('setPublicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_SET,
          payload: { publicationIds: [1, 2], selected: true },
        },
      ];

      const store = getStore();
      store.dispatch(setPublicationSelection([1, 2], true));
      expect(store.getActions()).toEqual(expectedActions);
    });

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
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('clearPublicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearPublicationSelection());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('clearPublicationsClaimedSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearPublicationsClaimedSelection());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('assign papers', () => {
    afterEach(() => {
      clear();
    });

    it('unassign papers', async () => {
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
        .onPost('/assign/literature/unassign', {
          from_author_recid: fromAuthorId,
          literature_ids: publicationSelection,
        })
        .replyOnce(200, { stub_author_id: stubAuthorId });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        setAssignDrawerVisibility(false),
      ];

      const dispatchPromise = store.dispatch(
        unassignPapers({ from: fromAuthorId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignSuccess).toHaveBeenCalledWith({
        from: fromAuthorId,
        to: stubAuthorId,
        literatureIds: Set(publicationSelection),
      });
    });

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
        .onPost('/assign/literature/assign', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_ids: publicationSelection,
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
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignSuccess).toHaveBeenCalledWith({
        from: fromAuthorId,
        to: toAuthorId,
        literatureIds: Set(publicationSelection),
      });
    });

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
        .onPost('/assign/literature/assign', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_ids: publicationSelection,
        })
        .replyOnce(500, {});

      const expectedActions = [];

      const dispatchPromise = store.dispatch(
        assignPapers({ from: fromAuthorId, to: toAuthorId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignError).toHaveBeenCalled();
    });
  });
  describe('assignOwnPapers (assigning to own profile)', () => {
    afterEach(() => {
      clear();
    });

    it('successful', async () => {
      const toAuthorId = 321;
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
        .onPost('/assign/literature/assign', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_ids: publicationSelection,
        })
        .replyOnce(200);

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsClaimedSelection(),
        clearPublicationsUnclaimedSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignOwnPapers({ from: fromAuthorId, to: toAuthorId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignSuccessOwnProfile).toHaveBeenCalledWith({
        numberOfClaimedPapers: 2,
        numberOfUnclaimedPapers: 1,
      });
    });
  });

  describe('unassignOwnPapers (unassigning own profile)', () => {
    afterEach(() => {
      clear();
    });

    it('successful', async () => {
      const stubAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2, 3];
      const publicationSelectionClaimed = [];
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
        .onPost('/assign/literature/unassign', {
          from_author_recid: fromAuthorId,
          literature_ids: publicationSelection,
        })
        .replyOnce(200, { stub_author_id: stubAuthorId });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
        clearPublicationsClaimedSelection(),
        clearPublicationsUnclaimedSelection(),
      ];

      const dispatchPromise = store.dispatch(
        unassignOwnPapers({ from: fromAuthorId, isUnassignAction: true })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(unassignSuccessOwnProfile).toHaveBeenCalled();
    });
  });
  describe('assignDifferentProfile', () => {
    afterEach(() => {
      clear();
    });

    it('successful', async () => {
      const toAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
        }),
      });

      mockHttp
        .onPost('/assign/literature/assign-different-profile', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_ids: publicationSelection,
        })
        .replyOnce(200, { created_rt_ticket: true });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignDifferentProfile({
          from: fromAuthorId,
          to: toAuthorId,
        })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignSuccessDifferentProfileClaimedPapers).toHaveBeenCalled();
    });

    it('assignDifferentProfileUnclaimedPapers successful for unclaimed papers', async () => {
      const toAuthorId = 5555;
      const fromAuthorId = 123;
      const publicationSelection = [1, 2];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        authors: fromJS({
          publicationSelection: Set(publicationSelection),
        }),
      });

      mockHttp
        .onPost('/assign/literature/assign-different-profile', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_ids: publicationSelection,
        })
        .replyOnce(200, {});

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPublicationSelection(),
      ];

      const dispatchPromise = store.dispatch(
        assignDifferentProfile({
          from: fromAuthorId,
          to: toAuthorId,
        })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignSuccessDifferentProfileUnclaimedPapers).toHaveBeenCalled();
    });
  });
});
