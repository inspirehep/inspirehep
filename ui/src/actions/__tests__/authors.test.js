import MockAdapter from 'axios-mock-adapter';
import { fromJS, Set } from 'immutable';
import { advanceTo, clear } from 'jest-date-mock';

import { getStore, mockActionCreator } from '../../fixtures/store';
import http from '../../common/http';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
} from '../actionTypes';
import fetchAuthor, {
  setPulicationSelection,
  clearPulicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
} from '../authors';
import { searchQueryUpdate } from '../search';
import { assignError, assignSuccess } from '../../authors/assignNotification';

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

    it('creates AUTHOR_SUCCESS', async done => {
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

    it('creates AUTHOR_ERROR', async done => {
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
    it('setPulicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_SET,
          payload: { publicationIds: [1, 2], selected: true },
        },
      ];

      const store = getStore();
      store.dispatch(setPulicationSelection([1, 2], true));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('clearPulicationSelection', () => {
      const expectedActions = [
        {
          type: AUTHOR_PUBLICATION_SELECTION_CLEAR,
        },
      ];

      const store = getStore();
      store.dispatch(clearPulicationSelection());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('assignPapers', () => {
    afterEach(() => {
      clear();
    });

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
        .onPost('/assign', {
          from_author_recid: fromAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(200, { stub_author_id: stubAuthorId });

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPulicationSelection(),
        setAssignDrawerVisibility(false),
      ];

      await store.dispatch(assignPapers({ from: fromAuthorId }));
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignSuccess).toHaveBeenCalledWith({
        from: fromAuthorId,
        to: stubAuthorId,
        papers: Set(publicationSelection),
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
        .onPost('/assign', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(200, {});

      const expectedActions = [
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: fakeNow }),
        clearPulicationSelection(),
        setAssignDrawerVisibility(false),
      ];

      await store.dispatch(
        assignPapers({ from: fromAuthorId, to: toAuthorId })
      );
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignSuccess).toHaveBeenCalledWith({
        from: fromAuthorId,
        to: toAuthorId,
        papers: Set(publicationSelection),
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
        .onPost('/assign', {
          from_author_recid: fromAuthorId,
          to_author_recid: toAuthorId,
          literature_recids: publicationSelection,
        })
        .replyOnce(500, {});

      const expectedActions = [];

      await store.dispatch(
        assignPapers({ from: fromAuthorId, to: toAuthorId })
      );
      expect(store.getActions()).toEqual(expectedActions);

      expect(assignError).toHaveBeenCalled();
    });
  });
});
