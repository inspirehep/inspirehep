import { Action, ActionCreator } from 'redux';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
} from './actionTypes';
import { HttpClientWrapper } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { RootState } from '../types';

// AUTHOR ACTIONS
function fetchingAuthor() {
  return {
    type: EDITOR_AUTHOR_REQUEST,
  };
}

function fetchAuthorSuccess(data: any) {
  return {
    type: EDITOR_AUTHOR_SUCCESS,
    payload: { data },
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
      dispatch(fetchAuthorSuccess(response?.data));
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
