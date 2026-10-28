import { Action, ActionCreator } from 'redux';
import { AxiosHeaders } from 'axios';
import { push } from 'redux-first-history';

import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
  EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  EDITOR_AUTHOR_REVISION_DATA_RESET,
  EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_RESET,
} from '../actionTypes';
import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import {
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
  notifyParallelEdition,
  notifyRevertToRevisionError,
} from '../../recordEditor/author/notifications';
import { httpErrorToActionPayload } from '../../common/utils';

export function resetEditor() {
  return {
    type: EDITOR_RESET,
  };
}

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
  return async (dispatch, _getState, http) => {
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
