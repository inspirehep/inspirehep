import { Action, ActionCreator } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  EDITOR_AUTHOR_WORKFLOW_ERROR,
  EDITOR_AUTHOR_WORKFLOW_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
  EDITOR_AUTHOR_WORKFLOW_SUCCESS,
} from '../actionTypes';
import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import {
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
} from '../../editor/notifications';
import { httpErrorToActionPayload } from '../../common/utils';
import { BACKOFFICE_API } from '../../common/routes';
import { httpClient as backofficeHttpClient } from '../backoffice';

type Dispatch = ThunkDispatch<RootState, HttpClientWrapper, Action>;

function fetchingAuthorWorkflowSchema() {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST,
  };
}

function fetchAuthorWorkflowSchemaSuccess(data: any) {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
    payload: { data },
  };
}

function fetchAuthorWorkflowSchemaError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthorWorkflowSchema(
  url: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(fetchingAuthorWorkflowSchema());

    try {
      const response = await http.get(url);
      dispatch(fetchAuthorWorkflowSchemaSuccess(response?.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchAuthorWorkflowSchemaError(error));
    }
  };
}

function fetchingAuthorWorkflow() {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_REQUEST,
  };
}

function fetchAuthorWorkflowSuccess(data: any) {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SUCCESS,
    payload: { data },
  };
}

function fetchAuthorWorkflowError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_ERROR,
    payload: { ...errorPayload },
  };
}

export function fetchAuthorWorkflow(
  id: string
): (
  dispatch: Dispatch,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch) => {
    dispatch(fetchingAuthorWorkflow());
    const resolveQuery = `${BACKOFFICE_API}/workflows/authors/${id}/`;

    try {
      const response = await backofficeHttpClient.get(resolveQuery);
      dispatch(fetchAuthorWorkflowSuccess(response?.data));
      await dispatch(fetchAuthorWorkflowSchema(response?.data.data.$schema));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchAuthorWorkflowError(error));
    }
  };
}

function savingAuthorWorkflow() {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST,
  };
}

function saveAuthorWorkflowSuccess(data: any) {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS,
    payload: { data },
  };
}

function saveAuthorWorkflowError(errorPayload: { error: Error }) {
  return {
    type: EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
    payload: { ...errorPayload },
  };
}

export function saveAuthorWorkflow(
  id: string,
  workflow: object
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState) => {
    dispatch(savingAuthorWorkflow());
    notifyEditionInProgress(id);
    try {
      const currentAuthor =
        getState().editor.getIn(['workflowData', 'author'])?.toJS() || {};
      await backofficeHttpClient.post(
        `${BACKOFFICE_API}/workflows/authors/validate/`,
        workflow
      );
      const response = await backofficeHttpClient.put(
        `${BACKOFFICE_API}/workflows/authors/${id}/`,
        { ...currentAuthor, data: workflow }
      );
      dispatch(saveAuthorWorkflowSuccess(response?.data));
      notifyEditionSuccess(id);
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      notifyEditionError(
        (typeof error?.error === 'string'
          ? error?.error
          : error?.error?.message) || 'An error occurred'
      );
      dispatch(saveAuthorWorkflowError(error));
    }
  };
}
