import MockAdapter from 'axios-mock-adapter';
import { CALL_HISTORY_METHOD } from 'redux-first-history';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
  EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_ERROR,
  EDITOR_QUEUES_REQUEST,
  EDITOR_QUEUES_SUCCESS,
  EDITOR_QUEUES_ERROR,
  EDITOR_USERS_REQUEST,
  EDITOR_USERS_SUCCESS,
  EDITOR_USERS_ERROR,
  EDITOR_TICKET_CREATION_REQUEST,
  EDITOR_TICKET_CREATION_SUCCESS,
  EDITOR_TICKET_CREATION_ERROR,
  EDITOR_TICKETS_REQUEST,
  EDITOR_TICKETS_SUCCESS,
  EDITOR_TICKETS_ERROR,
  EDITOR_RESOLVE_TICKET_REQUEST,
  EDITOR_RESOLVE_TICKET_SUCCESS,
  EDITOR_RESOLVE_TICKET_ERROR,
} from '../actionTypes';
import {
  notifyCreateTicketError,
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
  notifyParallelEdition,
  notifyResolveTicketError,
  notifyRevertToRevisionError,
} from '../../recordEditor/author/notifications';
import {
  createTicket,
  fetchAuthor,
  fetchAuthorRevisionData,
  fetchAuthorRevisions,
  fetchQueues,
  fetchTickets,
  fetchUsers,
  resolveTicket,
  saveAuthor,
  revertToRevision,
} from '../recordEditor';

const mockHttp = new MockAdapter(http.httpClient);

vi.mock('../../recordEditor/author/notifications', () => ({
  notifyEditionInProgress: vi.fn(),
  notifyEditionSuccess: vi.fn(),
  notifyEditionError: vi.fn(),
  notifyRevertToRevisionError: vi.fn(),
  notifyCreateTicketError: vi.fn(),
  notifyResolveTicketError: vi.fn(),
  notifyParallelEdition: vi.fn(),
}));

afterEach(() => {
  mockHttp.reset();
});

describe('recordEditor - async action creators', () => {
  describe('fetchAuthor', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('creates EDITOR_AUTHOR_SUCCESS', async () => {
      const responseData = { metadata: { control_number: 123 } };
      mockHttp.onGet('/editor/authors/123').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_AUTHOR_REQUEST },
        { type: EDITOR_AUTHOR_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor('123'));
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
        { type: EDITOR_AUTHOR_REQUEST },
        { type: EDITOR_AUTHOR_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor('123'));
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyParallelEdition).toHaveBeenCalledWith(userLocks);
    });

    it('creates EDITOR_AUTHOR_ERROR', async () => {
      mockHttp
        .onGet('/editor/authors/123')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_AUTHOR_REQUEST },
        {
          type: EDITOR_AUTHOR_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthor('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchAuthorRevisions', () => {
    it('creates EDITOR_AUTHOR_REVISIONS_SUCCESS', async () => {
      const responseData = [{ rev_id: 1 }, { rev_id: 2 }];
      mockHttp
        .onGet('/editor/authors/123/revisions')
        .replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_AUTHOR_REVISIONS_REQUEST },
        {
          type: EDITOR_AUTHOR_REVISIONS_SUCCESS,
          payload: { data: responseData },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthorRevisions('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_AUTHOR_REVISIONS_ERROR', async () => {
      mockHttp
        .onGet('/editor/authors/123/revisions')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_AUTHOR_REVISIONS_REQUEST },
        {
          type: EDITOR_AUTHOR_REVISIONS_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthorRevisions('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchAuthorRevisionData', () => {
    it('creates EDITOR_AUTHOR_REVISION_DATA_SUCCESS', async () => {
      const responseData = { control_number: '100' };
      mockHttp.onGet('/editor/revisions/123/456').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_AUTHOR_REVISION_DATA_REQUEST },
        {
          type: EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
          payload: { data: responseData },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthorRevisionData('123', 456));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_AUTHOR_REVISION_DATA_ERROR', async () => {
      mockHttp
        .onGet('/editor/revisions/123/456')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_AUTHOR_REVISION_DATA_REQUEST },
        {
          type: EDITOR_AUTHOR_REVISION_DATA_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthorRevisionData('123', 456));
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
    it('creates EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS', async () => {
      mockHttp.onPut('editor/authors/123/revisions/revert').replyOnce(200);

      const expectedActions = [
        { type: EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST },
        { type: EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS },
        { type: EDITOR_AUTHOR_REQUEST },
        { type: EDITOR_AUTHOR_REVISIONS_REQUEST },
      ];

      const store = getStore();
      await store.dispatch(revertToRevision('123', 100));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR', async () => {
      mockHttp
        .onPut('editor/authors/123/revisions/revert')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST },
        {
          type: EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
        { type: EDITOR_AUTHOR_REQUEST },
        { type: EDITOR_AUTHOR_REVISIONS_REQUEST },
      ];

      const store = getStore();
      await store.dispatch(revertToRevision('123', 100));
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyRevertToRevisionError).toHaveBeenCalledWith('Error');
    });
  });

  describe('fetchQueues', () => {
    it('creates EDITOR_QUEUES_SUCCESS', async () => {
      const responseData = [{ id: '1', name: 'Authors' }];
      mockHttp.onGet('/editor/rt/queues').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_QUEUES_REQUEST },
        { type: EDITOR_QUEUES_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchQueues());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_QUEUES_ERROR', async () => {
      mockHttp.onGet('/editor/rt/queues').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_QUEUES_REQUEST },
        {
          type: EDITOR_QUEUES_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchQueues());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchUsers', () => {
    it('creates EDITOR_USERS_SUCCESS', async () => {
      const responseData = [{ id: '1', name: 'alice' }];
      mockHttp.onGet('/editor/rt/users').replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_USERS_REQUEST },
        { type: EDITOR_USERS_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchUsers());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_USERS_ERROR', async () => {
      mockHttp.onGet('/editor/rt/users').replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_USERS_REQUEST },
        {
          type: EDITOR_USERS_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchUsers());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('createTicket', () => {
    const payload = {
      description: 'description',
      owner: 'alice',
      queue: 'AUTHORS',
      subject: 'subject',
    };

    it('creates EDITOR_TICKET_CREATION_SUCCESS', async () => {
      mockHttp
        .onPost('/editor/literature/123/rt/tickets/create', payload)
        .replyOnce(200);

      const expectedActions = [
        { type: EDITOR_TICKET_CREATION_REQUEST },
        { type: EDITOR_TICKET_CREATION_SUCCESS },
        { type: EDITOR_TICKETS_REQUEST },
      ];

      const store = getStore();
      const result = await store.dispatch(createTicket('123', payload));
      expect(result).toBe(true);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_TICKET_CREATION_ERROR', async () => {
      mockHttp
        .onPost('/editor/literature/123/rt/tickets/create')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_TICKET_CREATION_REQUEST },
        {
          type: EDITOR_TICKET_CREATION_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      const result = await store.dispatch(createTicket('123', payload));
      expect(result).toBe(false);
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyCreateTicketError).toHaveBeenCalledWith('Error');
    });
  });

  describe('fetchTickets', () => {
    it('creates EDITOR_TICKETS_SUCCESS', async () => {
      const responseData = [{ id: '1', subject: 'a ticket' }];
      mockHttp
        .onGet('/editor/authors/123/rt/tickets')
        .replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_TICKETS_REQUEST },
        { type: EDITOR_TICKETS_SUCCESS, payload: { data: responseData } },
      ];

      const store = getStore();
      await store.dispatch(fetchTickets('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_TICKETS_ERROR', async () => {
      mockHttp
        .onGet('/editor/authors/123/rt/tickets')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_TICKETS_REQUEST },
        {
          type: EDITOR_TICKETS_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchTickets('123'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('resolveTicket', () => {
    it('creates EDITOR_RESOLVE_TICKET_SUCCESS and refetches tickets', async () => {
      const responseData = { id: '1', status: 'resolved' };
      mockHttp
        .onGet('/editor/literature/123/rt/tickets/456/resolve')
        .replyOnce(200, responseData);

      const expectedActions = [
        { type: EDITOR_RESOLVE_TICKET_REQUEST },
        {
          type: EDITOR_RESOLVE_TICKET_SUCCESS,
          payload: { data: responseData },
        },
        { type: EDITOR_TICKETS_REQUEST },
      ];

      const store = getStore();
      await store.dispatch(resolveTicket('123', '456'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates EDITOR_RESOLVE_TICKET_ERROR and notifies', async () => {
      mockHttp
        .onGet('/editor/literature/123/rt/tickets/456/resolve')
        .replyOnce(500, { message: 'Error' });

      const expectedActions = [
        { type: EDITOR_RESOLVE_TICKET_REQUEST },
        {
          type: EDITOR_RESOLVE_TICKET_ERROR,
          payload: {
            error: { status: 500, message: 'Error' },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(resolveTicket('123', '456'));
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyResolveTicketError).toHaveBeenCalledWith('Error');
    });
  });
});
