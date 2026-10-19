import { Action, ActionCreator } from 'redux';
import { push } from 'redux-first-history';
import { AxiosHeaders } from 'axios';

import {
  EDITOR_RESET,
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
  EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_RESET,
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
} from './actionTypes';
import { HttpClientWrapper } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { RootState } from '../types';
import {
  notifyCreateTicketError,
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
  notifyParallelEdition,
  notifyResolveTicketError,
  notifyRevertToRevisionError,
} from '../recordEditor/author/notifications';

export function resetEditor() {
  return {
    type: EDITOR_RESET,
  };
}

// AUTHOR ACTIONS
function fetchingAuthor() {
  return {
    type: EDITOR_AUTHOR_REQUEST,
  };
}

function fetchAuthorSuccess(data: any, eTag: string | undefined) {
  return {
    type: EDITOR_AUTHOR_SUCCESS,
    payload: { data, eTag },
  };
}

function fetchAuthorError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthor(
  id: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingAuthor());
    const resolveQuery = `/editor/authors/${id}`;

    try {
      const response = await http.get(`${resolveQuery}`);
      const eTag = (response?.headers as AxiosHeaders)?.get('ETag') as
        | string
        | undefined;
      const userLocks = response.data.user_locks;
      if (userLocks) {
        notifyParallelEdition(userLocks);
      }
      dispatch(fetchAuthorSuccess(response?.data, eTag));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchAuthorError(error));
    }
  };
}

function fetchingAuthorRevisions() {
  return {
    type: EDITOR_AUTHOR_REVISIONS_REQUEST,
  };
}

function fetchAuthorRevisionsSuccess(data: any) {
  return {
    type: EDITOR_AUTHOR_REVISIONS_SUCCESS,
    payload: { data },
  };
}

function fetchAuthorRevisionsError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_REVISIONS_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthorRevisions(
  id: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingAuthorRevisions());
    const resolveQuery = `/editor/authors/${id}/revisions`;

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchAuthorRevisionsSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchAuthorRevisionsError(error));
    }
  };
}

function fetchingAuthorRevisionData() {
  return {
    type: EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  };
}

function fetchAuthorRevisionDataSuccess(data: any) {
  return {
    type: EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
    payload: { data },
  };
}

function fetchAuthorRevisionDataError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_REVISION_DATA_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthorRevisionData(
  recUUID: string,
  transactionId: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingAuthorRevisionData());
    const resolveQuery = `/editor/revisions/${recUUID}/${transactionId}`;

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchAuthorRevisionDataSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchAuthorRevisionDataError(error));
    }
  };
}

export function resetAuthorRevisionData() {
  return {
    type: EDITOR_AUTHOR_REVISION_DATA_RESET,
  };
}

function revertingToRevision() {
  return {
    type: EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
  };
}

function revertToRevisionSuccess() {
  return {
    type: EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
  };
}

function revertToRevisionError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
    payload: { ...errorPayload },
  };
}

export function revertToRevision(
  id: string,
  revisionId: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(revertingToRevision());
    try {
      await http.put(`editor/authors/${id}/revisions/revert`, {
        revision_id: revisionId,
      });
      dispatch(revertToRevisionSuccess());
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      notifyRevertToRevisionError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.message) || 'An error occurred'
      );
      dispatch(revertToRevisionError(error));
    }
    dispatch(fetchAuthor(id));
    dispatch(fetchAuthorRevisions(id));
  };
}

function savingAuthor() {
  return {
    type: EDITOR_AUTHOR_SAVE_REQUEST,
  };
}

function saveAuthorSuccess() {
  return {
    type: EDITOR_AUTHOR_SAVE_SUCCESS,
  };
}

function saveAuthorError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_SAVE_ERROR,
    payload: { ...errorPayload },
  };
}

export function saveAuthor(
  id: string,
  record: object
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(savingAuthor());
    notifyEditionInProgress(id);
    try {
      const ifMatchHeader = getState().recordEditor.getIn([
        'recordData',
        'currentRecordETag',
      ]);
      await http.put(`/authors/${id}`, record, {
        headers: new AxiosHeaders({ 'If-Match': ifMatchHeader }),
      });
      dispatch(saveAuthorSuccess());
      notifyEditionSuccess(id);
      dispatch(push(`/authors/${id}`));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      notifyEditionError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.message) || 'An error occurred'
      );
      dispatch(saveAuthorError(error));
    }
  };
}

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
