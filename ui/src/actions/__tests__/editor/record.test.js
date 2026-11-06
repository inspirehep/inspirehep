import MockAdapter from 'axios-mock-adapter';
import { CALL_HISTORY_METHOD } from 'redux-first-history';

import http from '../../../common/http';
import {
  EDITOR_RECORD_ERROR,
  EDITOR_RECORD_REQUEST,
  EDITOR_RECORD_SUCCESS,
  EDITOR_RECORD_REVISIONS_REQUEST,
  EDITOR_RECORD_REVISIONS_ERROR,
  EDITOR_RECORD_REVISIONS_SUCCESS,
  EDITOR_RECORD_REVISION_DATA_REQUEST,
  EDITOR_RECORD_REVISION_DATA_ERROR,
  EDITOR_RECORD_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_RECORD_REVERT_TO_REVISION_REQUEST,
  EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS,
  EDITOR_RECORD_REVERT_TO_REVISION_ERROR,
} from '../../actionTypes';
import { getStore } from '../../../fixtures/store';
import {
  fetchRecord,
  fetchRecordRevisionData,
  fetchRecordRevisions,
  revertToRevision,
  saveAuthor,
} from '../../editor/record';
import {
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
  notifyParallelEdition,
  notifyRevertToRevisionError,
} from '../../../editor/notifications';

const mockHttp = new MockAdapter(http.httpClient);

vi.mock('../../../editor/notifications', () => ({
  notifyEditionInProgress: vi.fn(),
  notifyEditionSuccess: vi.fn(),
  notifyEditionError: vi.fn(),
  notifyRevertToRevisionError: vi.fn(),
  notifyParallelEdition: vi.fn(),
}));

afterEach(() => {
  mockHttp.reset();
});

describe('record - async actions creator', () => {
  describe('fetchRecord', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('creates EDITOR_RECORD_SUCCESS', async () => {
      const responseData = { metadata: { control_number: 123 } };
      mockHttp.onGet('/editor/authors/123').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_RECORD_REQUEST },
        { type: EDITOR_RECORD_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchRecord('authors', '123'));
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyParallelEdition).not.toHaveBeenCalled();
    });

    it('notifies parallel edition when response has user_locks', async () => {
      const userLocks = 'Someone else is editing this record';
      const responseData = {
        metadata: { control_number: 123 },
        user_locks: userLocks,
      };
      mockHttp.onGet('/editor/authors/123').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_RECORD_REQUEST },
        { type: EDITOR_RECORD_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchRecord('authors', '123'));
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyParallelEdition).toHaveBeenCalledWith(userLocks);
    });

    it('creates EDITOR_RECORD_ERROR', async () => {
      mockHttp
        .onGet('/editor/authors/123')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_RECORD_REQUEST },
        {
          type: EDITOR_RECORD_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchRecord('authors', '123'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchRecordRevisions', () => {
    it('creates EDITOR_RECORD_REVISIONS_SUCCESS', async () => {
      const responseData = [{ rev_id: 1 }, { rev_id: 2 }];
      mockHttp
        .onGet('/editor/authors/123/revisions')
        .replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_RECORD_REVISIONS_REQUEST },
        {
          type: EDITOR_RECORD_REVISIONS_SUCCESS,
          payload: { data: responseData },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchRecordRevisions('authors', '123'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_RECORD_REVISIONS_ERROR', async () => {
      mockHttp
        .onGet('/editor/authors/123/revisions')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_RECORD_REVISIONS_REQUEST },
        {
          type: EDITOR_RECORD_REVISIONS_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchRecordRevisions('authors', '123'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchRecordRevisionData', () => {
    it('creates EDITOR_RECORD_REVISION_DATA_SUCCESS', async () => {
      const responseData = { control_number: '100' };
      mockHttp.onGet('/editor/revisions/123/456').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_RECORD_REVISION_DATA_REQUEST },
        {
          type: EDITOR_RECORD_REVISION_DATA_SUCCESS,
          payload: { data: responseData },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchRecordRevisionData('123', 456));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_RECORD_REVISION_DATA_ERROR', async () => {
      mockHttp
        .onGet('/editor/revisions/123/456')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_RECORD_REVISION_DATA_REQUEST },
        {
          type: EDITOR_RECORD_REVISION_DATA_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchRecordRevisionData('123', 456));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('saveAuthor', () => {
    it('creates EDITOR_AUTHOR_SAVE_SUCCESS', async () => {
      mockHttp.onPut('/authors/123').replyOnce(200);

      const expectedActions = [
        { type: EDITOR_AUTHOR_SAVE_REQUEST },
        { type: EDITOR_AUTHOR_SAVE_SUCCESS },
        {
          type: CALL_HISTORY_METHOD,
          payload: {
            args: ['/authors/123'],
            method: 'push',
          },
        },
      ];

      const store = getStore();
      await store.dispatch(
        saveAuthor('123', { control_number: '123', name: { value: 'Test' } })
      );
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyEditionInProgress).toHaveBeenCalledWith('123');
      expect(notifyEditionSuccess).toHaveBeenCalledWith('123');
    });

    it('creates EDITOR_AUTHOR_SAVE_ERROR', async () => {
      mockHttp.onPut('/authors/123').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_AUTHOR_SAVE_REQUEST },
        {
          type: EDITOR_AUTHOR_SAVE_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(
        saveAuthor('123', { control_number: '123', name: { value: 'Test' } })
      );
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyEditionInProgress).toHaveBeenCalledWith('123');
      expect(notifyEditionError).toHaveBeenCalledWith('Error');
    });
  });

  describe('revertToRevision', () => {
    it('creates EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS', async () => {
      mockHttp.onPut('editor/authors/123/revisions/revert').replyOnce(200);

      const expectedActions = [
        { type: EDITOR_RECORD_REVERT_TO_REVISION_REQUEST },
        { type: EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS },
        { type: EDITOR_RECORD_REQUEST },
        { type: EDITOR_RECORD_REVISIONS_REQUEST },
      ];

      const store = getStore();
      await store.dispatch(revertToRevision('authors', '123', 100));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_RECORD_REVERT_TO_REVISION_ERROR', async () => {
      mockHttp
        .onPut('editor/authors/123/revisions/revert')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_RECORD_REVERT_TO_REVISION_REQUEST },
        {
          type: EDITOR_RECORD_REVERT_TO_REVISION_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
        { type: EDITOR_RECORD_REQUEST },
        { type: EDITOR_RECORD_REVISIONS_REQUEST },
      ];

      const store = getStore();
      await store.dispatch(revertToRevision('authors', '123', 100));
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyRevertToRevisionError).toHaveBeenCalledWith('Error');
    });
  });
});
