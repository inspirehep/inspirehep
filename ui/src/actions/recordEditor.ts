import { Action, ActionCreator } from 'redux';
import { push } from 'redux-first-history';
import { AxiosHeaders } from 'axios';

import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
} from './actionTypes';
import { HttpClientWrapper } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { RootState } from '../types';
import {
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
} from '../recordEditor/author/notifications';

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
      const ifMatchHeader = getState().recordEditor.get('currentRecordETag');
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
