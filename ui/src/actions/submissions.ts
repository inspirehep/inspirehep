import { push } from 'connected-react-router';
import { List } from 'immutable';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';

import {
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_ERROR,
  INITIAL_FORM_DATA_SUCCESS,
  SUBMIT_REQUEST,
} from './actionTypes';
import { SUBMISSIONS } from '../common/routes';
import { httpErrorToActionPayload } from '../common/utils';
import { HttpClientWrapper } from '../common/http';

export const REDIRECT_TO_EDITOR = List([
  'experiments',
  'institutions',
  'journals',
]);

function submitSuccess(payload: { pidType: string; pidValue: number }) {
  return {
    type: SUBMIT_SUCCESS,
    payload,
  };
}

function submitRequest() {
  return {
    type: SUBMIT_REQUEST,
  };
}

function submitError(error: { error: Error }) {
  return {
    type: SUBMIT_ERROR,
    payload: error,
  };
}

function fetchingInitialFormData(
  payload: { pidType: string; pidValue: number } | { id?: number }
) {
  return {
    type: INITIAL_FORM_DATA_REQUEST,
    payload, // only used for testing
  };
}

function fetchInitialFormDataError(error: { error: Error }) {
  return {
    type: INITIAL_FORM_DATA_ERROR,
    payload: error,
  };
}

function fetchInitialFormDataSuccess(data: Record<string, string | string[]>) {
  return {
    type: INITIAL_FORM_DATA_SUCCESS,
    payload: data,
  };
}

export function submit<T>(
  pidType: string,
  data: T
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(submitRequest());
    try {
      const response = await http.post(`${SUBMISSIONS}/${pidType}`, { data });
      dispatch(submitSuccess(response.data));
      if (REDIRECT_TO_EDITOR.includes(pidType)) {
        window.open(
          `/editor/record/${pidType}/${response.data.control_number}`,
          '_self'
        );
      } else {
        dispatch(push(`/submissions/${pidType}/new/success`));
      }
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(submitError({ error }));
    }
  };
}

export function submitUpdate(
  pidType: string,
  pidValue: number,
  data: Record<string, string | string[] | number>
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(submitRequest());
    try {
      const response = await http.put(`${SUBMISSIONS}/${pidType}/${pidValue}`, {
        data,
      });
      dispatch(submitSuccess(response.data));
      dispatch(push(`/submissions/${pidType}/${pidValue}/success`));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(submitError({ error }));
    }
  };
}

export function fetchUpdateFormData(
  pidType: string,
  pidValue: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingInitialFormData({ pidValue, pidType }));
    try {
      const response = await http.get(`${SUBMISSIONS}/${pidType}/${pidValue}`);
      dispatch(fetchInitialFormDataSuccess(response.data));
    } catch (err) {
      const error = httpErrorToActionPayload(err);
      dispatch(fetchInitialFormDataError(error));
    }
  };
}

export function importExternalLiterature(
  id: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingInitialFormData({ id }));
    try {
      const response = await http.get(`/literature/import/${id}`);
      dispatch(fetchInitialFormDataSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(fetchInitialFormDataError(errorPayload));
    }
  };
}
