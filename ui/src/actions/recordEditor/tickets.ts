import { Action, ActionCreator } from 'redux';
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
} from '../actionTypes';
import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import { httpErrorToActionPayload } from '../../common/utils';
import {
  notifyCreateTicketError,
  notifyResolveTicketError,
} from '../../recordEditor/author/notifications';

function fetchingQueues() {
  return {
    type: EDITOR_QUEUES_REQUEST,
  };
}

function fetchQueuesSuccess(data: any) {
  return {
    type: EDITOR_QUEUES_SUCCESS,
    payload: { data },
  };
}

function fetchQueuesError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_QUEUES_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchQueues(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingQueues());
    const resolveQuery = '/editor/rt/queues';

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchQueuesSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchQueuesError(error));
    }
  };
}

function fetchingUsers() {
  return {
    type: EDITOR_USERS_REQUEST,
  };
}

function fetchUsersSuccess(data: any) {
  return {
    type: EDITOR_USERS_SUCCESS,
    payload: { data },
  };
}

function fetchUsersError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_USERS_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchUsers(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingUsers());
    const resolveQuery = '/editor/rt/users';

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchUsersSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchUsersError(error));
    }
  };
}

function fetchingTickets() {
  return {
    type: EDITOR_TICKETS_REQUEST,
  };
}

function fetchTicketsSuccess(data: any) {
  return {
    type: EDITOR_TICKETS_SUCCESS,
    payload: { data },
  };
}

function fetchTicketsError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_TICKETS_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchTickets(
  id: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingTickets());
    const resolveQuery = `/editor/authors/${id}/rt/tickets`;

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchTicketsSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchTicketsError(error));
    }
  };
}

function creatingTicket() {
  return {
    type: EDITOR_TICKET_CREATION_REQUEST,
  };
}

function createTicketSuccess() {
  return {
    type: EDITOR_TICKET_CREATION_SUCCESS,
  };
}

function createTicketError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_TICKET_CREATION_ERROR,
    payload: { ...errorPayload },
  };
}

export function createTicket(
  id: string,
  payload: {
    description?: string;
    owner?: string;
    queue: string;
    subject: string;
  }
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<boolean> {
  return async (dispatch, _getState, http) => {
    dispatch(creatingTicket());
    try {
      await http.post(`/editor/literature/${id}/rt/tickets/create`, payload);
      dispatch(createTicketSuccess());
      dispatch(fetchTickets(id));
      return true;
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      notifyCreateTicketError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.message) || 'An error occurred'
      );
      dispatch(createTicketError(error));
      return false;
    }
  };
}

function resolvingTicket() {
  return {
    type: EDITOR_RESOLVE_TICKET_REQUEST,
  };
}

function resolveTicketSuccess(data: any) {
  return {
    type: EDITOR_RESOLVE_TICKET_SUCCESS,
    payload: { data },
  };
}

function resolveTicketError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_RESOLVE_TICKET_ERROR,
    payload: { ...errorPayload },
  };
}

export function resolveTicket(
  controlNumber: string,
  ticketId: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(resolvingTicket());
    const resolveQuery = `/editor/literature/${controlNumber}/rt/tickets/${ticketId}/resolve`;

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(resolveTicketSuccess(response?.data));
      dispatch(fetchTickets(controlNumber));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      notifyResolveTicketError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.message) || 'An error occurred'
      );
      dispatch(resolveTicketError(error));
    }
  };
}
