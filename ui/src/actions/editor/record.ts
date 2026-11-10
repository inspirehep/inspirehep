import { Action, ActionCreator } from 'redux';
import { AxiosHeaders } from 'axios';
import { push } from 'redux-first-history';

import {
  EDITOR_RECORD_REQUEST,
  EDITOR_RECORD_ERROR,
  EDITOR_RECORD_SUCCESS,
  EDITOR_RECORD_REVISIONS_REQUEST,
  EDITOR_RECORD_REVISIONS_ERROR,
  EDITOR_RECORD_REVISIONS_SUCCESS,
  EDITOR_RECORD_REVISION_DATA_REQUEST,
  EDITOR_RECORD_REVISION_DATA_SUCCESS,
  EDITOR_RECORD_REVISION_DATA_ERROR,
  EDITOR_RECORD_REVISION_DATA_RESET,
  EDITOR_RECORD_REVERT_TO_REVISION_REQUEST,
  EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS,
  EDITOR_RECORD_REVERT_TO_REVISION_ERROR,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_DOCUMENT_UPLOAD_REQUEST,
  EDITOR_DOCUMENT_UPLOAD_SUCCESS,
  EDITOR_DOCUMENT_UPLOAD_ERROR,
} from '../actionTypes';
import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import {
  notifyDocumentUploadError,
  notifyDocumentUploadInProgress,
  notifyDocumentUploadSuccess,
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
  notifyParallelEdition,
  notifyRevertToRevisionError,
} from '../../editor/notifications';
import { httpErrorToActionPayload } from '../../common/utils';

function fetchingRecord() {
  return {
    type: EDITOR_RECORD_REQUEST,
  };
}

function fetchRecordSuccess(data: any, eTag: string | undefined) {
  return {
    type: EDITOR_RECORD_SUCCESS,
    payload: { data, eTag },
  };
}

function fetchRecordError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_RECORD_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchRecord(
  type: string,
  id: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingRecord());
    const resolveQuery = `/editor/${type}/${id}`;

    try {
      const response = await http.get(`${resolveQuery}`);
      const eTag = (response?.headers as AxiosHeaders)?.get('ETag') as
        | string
        | undefined;
      const userLocks = response.data.user_locks;
      if (userLocks) {
        notifyParallelEdition(userLocks);
      }
      dispatch(fetchRecordSuccess(response?.data, eTag));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchRecordError(error));
    }
  };
}

function fetchingRecordRevisions() {
  return {
    type: EDITOR_RECORD_REVISIONS_REQUEST,
  };
}

function fetchRecordRevisionsSuccess(data: any) {
  return {
    type: EDITOR_RECORD_REVISIONS_SUCCESS,
    payload: { data },
  };
}

function fetchRecordRevisionsError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_RECORD_REVISIONS_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchRecordRevisions(
  type: string,
  id: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingRecordRevisions());
    const resolveQuery = `/editor/${type}/${id}/revisions`;

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchRecordRevisionsSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchRecordRevisionsError(error));
    }
  };
}

function fetchingRecordRevisionData() {
  return {
    type: EDITOR_RECORD_REVISION_DATA_REQUEST,
  };
}

function fetchRecordRevisionDataSuccess(data: any) {
  return {
    type: EDITOR_RECORD_REVISION_DATA_SUCCESS,
    payload: { data },
  };
}

function fetchRecordRevisionDataError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_RECORD_REVISION_DATA_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchRecordRevisionData(
  recUUID: string,
  transactionId: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingRecordRevisionData());
    const resolveQuery = `/editor/revisions/${recUUID}/${transactionId}`;

    try {
      const response = await http.get(`${resolveQuery}`);
      dispatch(fetchRecordRevisionDataSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchRecordRevisionDataError(error));
    }
  };
}

export function resetRecordRevisionData() {
  return {
    type: EDITOR_RECORD_REVISION_DATA_RESET,
  };
}

function revertingToRevision() {
  return {
    type: EDITOR_RECORD_REVERT_TO_REVISION_REQUEST,
  };
}

function revertToRevisionSuccess() {
  return {
    type: EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS,
  };
}

function revertToRevisionError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_RECORD_REVERT_TO_REVISION_ERROR,
    payload: { ...errorPayload },
  };
}

export function revertToRevision(
  type: string,
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
      await http.put(`editor/${type}/${id}/revisions/revert`, {
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
    dispatch(fetchRecord(type, id));
    dispatch(fetchRecordRevisions(type, id));
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
      const ifMatchHeader = getState().editor.getIn([
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

function uploadingDocument() {
  return {
    type: EDITOR_DOCUMENT_UPLOAD_REQUEST,
  };
}

function uploadDocumentSuccess() {
  return {
    type: EDITOR_DOCUMENT_UPLOAD_SUCCESS,
  };
}

function uploadDocumentError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_DOCUMENT_UPLOAD_ERROR,
    payload: { ...errorPayload },
  };
}

export function uploadDocument(
  type: string,
  id: string,
  file: File
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<string | undefined> {
  return async (dispatch, _getState, http) => {
    dispatch(uploadingDocument());
    notifyDocumentUploadInProgress(file.name);
    try {
      const body = new FormData();
      body.append('file', file, file.name);
      const response = await http.post(`/editor/${type}/${id}/upload`, body);
      dispatch(uploadDocumentSuccess());
      notifyDocumentUploadSuccess(file.name);
      return response.data.path;
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      notifyDocumentUploadError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.message) || 'An error occurred'
      );
      dispatch(uploadDocumentError(error));
      return undefined;
    }
  };
}
