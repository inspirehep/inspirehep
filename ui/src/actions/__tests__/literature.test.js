import MockAdapter from 'axios-mock-adapter';
import { fromJS, Set } from 'immutable';
import { advanceTo, clear } from 'jest-date-mock';
import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
  LITERATURE_AUTHORS_ERROR,
  LITERATURE_AUTHORS_REQUEST,
  LITERATURE_AUTHORS_SUCCESS,
  LITERATURE_ALL_AUTHORS_ERROR,
  LITERATURE_ALL_AUTHORS_REQUEST,
  LITERATURE_ALL_AUTHORS_SUCCESS,
  LITERATURE_REFERENCES_ERROR,
  LITERATURE_REFERENCES_REQUEST,
  LITERATURE_REFERENCES_SUCCESS,
  LITERATURE_SELECTION_SET,
  LITERATURE_SELECTION_CLEAR,
  SEARCH_QUERY_UPDATE,
} from '../actionTypes';
import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchLiteratureAllAuthors,
  fetchLiteratureReferences,
  setLiteratureSelection,
  clearLiteratureSelection,
  setAssignDrawerVisibility,
  assignPapers,
  exportToCds,
  assignLiteratureItem,
  setAssignLiteratureItemDrawerVisibility,
  assignLiteratureItemNoNameMatch,
  checkNameCompatibility,
} from '../literature';
import { assignSuccessDifferentProfileClaimedPapers } from '../../authors/assignNotification';
import {
  assignError,
  assignSuccess,
  assigning,
  exportToCdsSuccess,
  exportToCdsError,
  exporting,
  assignLiteratureItemSuccess,
} from '../../literature/assignNotification';
import { LITERATURE_REFERENCES_NS } from '../../search/constants';

const mockHttp = new MockAdapter(http.httpClient);
jest.mock('../../literature/assignNotification');
jest.mock('../../authors/assignNotification');

describe('literature - async action creators', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('happy - creates LITERATURE_SUCCESS', async () => {
    mockHttp.onGet('/literature/123').replyOnce(200, {});

    const expectedActions = [
      { type: LITERATURE_REQUEST, payload: { recordId: 123 } },
      { type: LITERATURE_SUCCESS, payload: {} },
    ];

    const store = getStore();
    await store.dispatch(fetchLiterature(123));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('unhappy - creates LITERATURE_ERROR', async () => {
    mockHttp.onGet('/literature/123').replyOnce(500);

    const expectedActions = [
      { type: LITERATURE_REQUEST, payload: { recordId: 123 } },
      {
        type: LITERATURE_ERROR,
        payload: { error: { status: 500 } },
        meta: { redirectableError: true },
      },
    ];

    const store = getStore();
    await store.dispatch(fetchLiterature(123));
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe('literature references', () => {
    it('happy - creates LITERATURE_REFERENCES_SUCCESS', async () => {
      mockHttp
        .onGet('/literature/123/references?size=10&page=1')
        .replyOnce(200, {});

      const expectedActions = [
        { type: LITERATURE_REFERENCES_REQUEST, payload: 1 },
        { type: LITERATURE_REFERENCES_SUCCESS, payload: {} },
        {
          type: SEARCH_QUERY_UPDATE,
          payload: {
            query: { page: 1, size: 10 },
            namespace: LITERATURE_REFERENCES_NS,
          },
        },
      ];

      const store = getStore();
      await store.dispatch(
        fetchLiteratureReferences(123, { page: 1, size: 10 })
      );
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('fetches references with merging the given query into the existing one ', async () => {
      mockHttp
        .onGet('/literature/123/references?size=10&page=10')
        .replyOnce(200, {});

      const expectedActions = [
        {
          type: LITERATURE_REFERENCES_REQUEST,
          payload: 10,
        },
        { type: LITERATURE_REFERENCES_SUCCESS, payload: {} },
        {
          type: SEARCH_QUERY_UPDATE,
          payload: {
            query: { size: 10, page: 10 },
            namespace: LITERATURE_REFERENCES_NS,
          },
        },
      ];

      const store = getStore({
        search: fromJS({
          namespaces: {
            [LITERATURE_REFERENCES_NS]: {
              query: { size: 10 },
              baseQuery: { size: 25, page: 1 },
            },
          },
        }),
        literature: fromJS({
          queryReferencesPage: 10,
        }),
      });
      await store.dispatch(fetchLiteratureReferences(123, { page: 10 }));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('unhappy - creates LITERATURE_REFERENCES_ERROR', async () => {
      mockHttp
        .onGet('/literature/123/references?size=10&page=1')
        .replyOnce(404, { message: 'Not found' });

      const expectedActions = [
        { type: LITERATURE_REFERENCES_REQUEST, payload: 1 },
        {
          type: LITERATURE_REFERENCES_ERROR,
          payload: { error: { status: 404, message: 'Not found' } },
        },
      ];

      const store = getStore();
      await store.dispatch(
        fetchLiteratureReferences(123, { page: 1, size: 10 })
      );
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('literature authors', () => {
    it('happy - creates LITERATURE_AUTHORS_SUCCESS', async () => {
      mockHttp.onGet('/literature/123/authors').replyOnce(200, {});

      const expectedActions = [
        { type: LITERATURE_AUTHORS_REQUEST },
        { type: LITERATURE_AUTHORS_SUCCESS, payload: {} },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('unhappy - creates LITERATURE_AUTHORS_ERROR', async () => {
      mockHttp.onGet('/literature/123/authors').replyOnce(500);

      const expectedActions = [
        { type: LITERATURE_AUTHORS_REQUEST },
        {
          type: LITERATURE_AUTHORS_ERROR,
          payload: {
            error: { status: 500 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('literature all authors', () => {
    it('happy - creates LITERATURE_ALL_AUTHORS_SUCCESS', async () => {
      mockHttp.onGet('/literature/123?field=authors').replyOnce(200, {});

      const expectedActions = [
        { type: LITERATURE_ALL_AUTHORS_REQUEST },
        { type: LITERATURE_ALL_AUTHORS_SUCCESS, payload: {} },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAllAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('unhappy - creates LITERATURE_ALL_AUTHORS_ERROR', async () => {
      mockHttp.onGet('/literature/123?field=authors').replyOnce(500);

      const expectedActions = [
        { type: LITERATURE_ALL_AUTHORS_REQUEST },
        {
          type: LITERATURE_ALL_AUTHORS_ERROR,
          payload: {
            error: { status: 500 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchLiteratureAllAuthors(123));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('select literature', () => {
    it('setLiteratureSelection', () => {
      const expectedActions = [
        {
          type: LITERATURE_SELECTION_SET,
          payload: { literatureIds: [1, 2], selected: true },
        },
      ];

      const store = getStore();
      store.dispatch(setLiteratureSelection([1, 2], true));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('clearLiteratureSelection', () => {
      const expectedActions = [
        {
          type: LITERATURE_SELECTION_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearLiteratureSelection());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('assignLiteratureItem', () => {
    afterEach(() => {
      clear();
    });

    it('successfully assigns paper to author', async () => {
      const to = 123456;
      const from = 654321;
      const literatureId = 159731;

      const store = getStore();

      mockHttp
        .onPost('/assign/literature/assign', {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: [literatureId],
        })
        .replyOnce(200, { message: 'Success' });

      const expectedActions = [];

      const dispatchPromise = store.dispatch(
        assignLiteratureItem({ from, to, literatureId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignLiteratureItemSuccess).toHaveBeenCalled();
    });

    it('error', async () => {
      const to = 123456;
      const from = 654321;
      const paperId = 159731;

      const store = getStore();

      mockHttp
        .onPost('/assign/literature/assign', {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: paperId,
        })
        .replyOnce(500, {});

      const expectedActions = [];

      const dispatchPromise = store.dispatch(
        assignLiteratureItem({ from, to, paperId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignError).toHaveBeenCalled();
    });
  });

  describe('assignLiteratureItemNoNameMatch', () => {
    afterEach(() => {
      clear();
    });

    it('successfully claims', async () => {
      const to = 123456;
      const from = 654321;
      const literatureId = 159731;

      const store = getStore();

      mockHttp
        .onPost('/assign/literature/assign-different-profile', {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: [literatureId],
        })
        .replyOnce(200, { message: 'Success' });

      const expectedActions = [setAssignLiteratureItemDrawerVisibility(null)];

      const dispatchPromise = store.dispatch(
        assignLiteratureItemNoNameMatch({ from, to, literatureId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignLiteratureItemSuccess).toHaveBeenCalled();
    });

    it('successfully creates rt_ticket', async () => {
      const to = 123456;
      const from = 654321;
      const literatureId = 159731;

      const store = getStore();

      mockHttp
        .onPost('/assign/literature/assign-different-profile', {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: [literatureId],
        })
        .replyOnce(200, { message: 'Success', created_rt_ticket: true });

      const expectedActions = [setAssignLiteratureItemDrawerVisibility(null)];

      const dispatchPromise = store.dispatch(
        assignLiteratureItemNoNameMatch({ from, to, literatureId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignSuccessDifferentProfileClaimedPapers).toHaveBeenCalled();
    });

    it('error', async () => {
      const to = 123456;
      const from = 654321;
      const literatureId = 159731;

      const store = getStore();

      mockHttp
        .onPost('/assign/literature/assign-different-profile', {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: literatureId,
        })
        .replyOnce(500, {});

      const expectedActions = [];

      const dispatchPromise = store.dispatch(
        assignLiteratureItemNoNameMatch({ from, to, literatureId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignError).toHaveBeenCalled();
    });
  });

  describe('checkNameCompatibility', () => {
    afterEach(() => {
      clear();
    });

    it('returns matching authors recid if exists and calls assignSuccessDifferentProfileClaimedPapers if recids dont match', async () => {
      const to = 123456;
      const literatureId = 159731;

      const store = getStore();

      mockHttp
        .onGet(
          `/assign/check-names-compatibility?literature_recid=${literatureId}`
        )
        .replyOnce(200, { matched_author_recid: 1010819 });

      const expectedActions = [];

      const dispatchPromise = store.dispatch(
        checkNameCompatibility({ to, literatureId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignSuccessDifferentProfileClaimedPapers).toHaveBeenCalled();
    });

    it('returns matching authors recid if exists and calls assignLiteratureItemSuccess if recids match', async () => {
      const to = 1010819;
      const literatureId = 159731;

      const store = getStore();

      mockHttp
        .onGet(
          `/assign/check-names-compatibility?literature_recid=${literatureId}`
        )
        .replyOnce(200, { matched_author_recid: 1010819 });

      const expectedActions = [];

      const dispatchPromise = store.dispatch(
        checkNameCompatibility({ to, literatureId })
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(assignLiteratureItemSuccess).toHaveBeenCalled();
    });

    it('error', async () => {
      const paperId = 159731;

      const store = getStore();

      mockHttp
        .onGet(`/assign/check-names-compatibility?literature_recid=${paperId}`)
        .replyOnce(500, {});

      const expectedActions = [
        setAssignLiteratureItemDrawerVisibility(paperId),
      ];

      const dispatchPromise = store.dispatch(
        setAssignLiteratureItemDrawerVisibility(paperId)
      );
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('assignPapers', () => {
    afterEach(() => {
      clear();
    });

    it('successfully assign papers to conference', async () => {
      const conferenceId = 123;
      const literatureSelection = [1, 2, 3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        literature: fromJS({
          literatureSelection: Set(literatureSelection),
        }),
      });

      mockHttp
        .onPost('/assign/conference', {
          conference_recid: conferenceId,
          literature_recids: literatureSelection,
        })
        .replyOnce(200, { message: 'Success' });

      const expectedActions = [
        clearLiteratureSelection(),
        setAssignDrawerVisibility(false),
      ];

      const dispatchPromise = store.dispatch(assignPapers(conferenceId));
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignSuccess).toHaveBeenCalledWith({
        conferenceId,
        papers: Set(literatureSelection),
      });
    });

    it('error', async () => {
      const conferenceId = 123;
      const literatureSelection = [1, 2, 3];

      const store = getStore({
        literature: fromJS({
          literatureSelection: Set(literatureSelection),
        }),
      });

      mockHttp
        .onPost('/assign/conference', {
          conference_recid: conferenceId,
          literature_recids: literatureSelection,
        })
        .replyOnce(500, {});

      const expectedActions = [];

      const dispatchPromise = store.dispatch(assignPapers(conferenceId));
      expect(assigning).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignError).toHaveBeenCalled();
    });
  });
  describe('exportToCds', () => {
    afterEach(() => {
      clear();
    });

    it('successfully export to cds', async () => {
      const literatureSelection = [1, 2, 3];
      const fakeNow = 1597314028798;

      advanceTo(fakeNow);

      const store = getStore({
        literature: fromJS({
          literatureSelection: Set(literatureSelection),
        }),
      });

      mockHttp
        .onPost('/assign/export-to-cds', {
          literature_recids: literatureSelection,
        })
        .replyOnce(200, { message: 'Success' });

      const expectedActions = [clearLiteratureSelection()];
      const dispatchPromise = store.dispatch(exportToCds());
      expect(exporting).toHaveBeenCalled();

      await dispatchPromise;
      expect(store.getActions()).toEqual(expectedActions);
      expect(exportToCdsSuccess).toHaveBeenCalled();
    });
  });
  it('error', async () => {
    const literatureSelection = [1, 2, 3];

    const store = getStore({
      literature: fromJS({
        literatureSelection: Set(literatureSelection),
      }),
    });

    mockHttp
      .onPost('/assign/export-to-cds', {
        literature_recids: literatureSelection,
      })
      .replyOnce(400, {});

    const expectedActions = [];

    const dispatchPromise = store.dispatch(exportToCds());
    expect(exporting).toHaveBeenCalled();

    await dispatchPromise;
    expect(store.getActions()).toEqual(expectedActions);

    expect(exportToCdsError).toHaveBeenCalled();
  });
});
