import MockAdapter from 'axios-mock-adapter';

import http from '../../../common/http';
import {
  EDITOR_QUEUES_ERROR,
  EDITOR_QUEUES_REQUEST,
  EDITOR_QUEUES_SUCCESS,
  EDITOR_RESOLVE_TICKET_ERROR,
  EDITOR_RESOLVE_TICKET_REQUEST,
  EDITOR_RESOLVE_TICKET_SUCCESS,
  EDITOR_TICKET_CREATION_ERROR,
  EDITOR_TICKET_CREATION_REQUEST,
  EDITOR_TICKET_CREATION_SUCCESS,
  EDITOR_TICKETS_ERROR,
  EDITOR_TICKETS_REQUEST,
  EDITOR_TICKETS_SUCCESS,
  EDITOR_USERS_ERROR,
  EDITOR_USERS_REQUEST,
  EDITOR_USERS_SUCCESS,
} from '../../actionTypes';
import { getStore } from '../../../fixtures/store';
import {
  createTicket,
  fetchQueues,
  fetchTickets,
  fetchUsers,
  resolveTicket,
} from '../../recordEditor/tickets';
import {
  notifyCreateTicketError,
  notifyResolveTicketError,
} from '../../../recordEditor/author/notifications';

const mockHttp = new MockAdapter(http.httpClient);

vi.mock('../../../recordEditor/author/notifications', () => ({
  notifyCreateTicketError: vi.fn(),
  notifyResolveTicketError: vi.fn(),
}));

afterEach(() => {
  mockHttp.reset();
});

describe('tickets - async actions creator', () => {
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
