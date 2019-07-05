import { push } from 'connected-react-router';

import {
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_ERROR,
  INITIAL_FORM_DATA_SUCCESS,
} from './actionTypes';
import { SUBMISSION_SUCCESS, SUBMISSIONS } from '../common/routes';
import { httpErrorToActionPayload } from '../common/utils';

function submitSuccess() {
  return {
    type: SUBMIT_SUCCESS,
  };
}

function submitError(error) {
  return {
    type: SUBMIT_ERROR,
    payload: error,
  };
}

function fetchingInitialFormData(payload) {
  return {
    type: INITIAL_FORM_DATA_REQUEST,
    payload, // only used for testing
  };
}

function fetchInitialFormDataError(error) {
  return {
    type: INITIAL_FORM_DATA_ERROR,
    payload: error,
  };
}

function fetchInitialFormDataSuccess(data) {
  return {
    type: INITIAL_FORM_DATA_SUCCESS,
    payload: data,
  };
}

export function submit(pidType, data) {
  return async (dispatch, getState, http) => {
    try {
      await http.post(`${SUBMISSIONS}/${pidType}`, { data });
      dispatch(submitSuccess());
      dispatch(push(SUBMISSION_SUCCESS));
    } catch (error) {
      dispatch(submitError(httpErrorToActionPayload(error)));
    }
  };
}

export function submitUpdate(pidType, pidValue, data) {
  return async (dispatch, getState, http) => {
    try {
      await http.put(`${SUBMISSIONS}/${pidType}/${pidValue}`, { data });
      dispatch(submitSuccess());
      dispatch(push(`/submissions/${pidType}/${pidValue}/success`));
    } catch (error) {
      dispatch(submitError(httpErrorToActionPayload(error)));
    }
  };
}

export function fetchUpdateFormData(pidType, pidValue) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingInitialFormData({ pidValue, pidType }));
    try {
      const response = await http.get(`${SUBMISSIONS}/${pidType}/${pidValue}`);
      dispatch(fetchInitialFormDataSuccess(response.data));
    } catch (error) {
      dispatch(fetchInitialFormDataError(httpErrorToActionPayload(error)));
    }
  };
}

export function importExternalLiterature(id) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingInitialFormData({ id }));
    try {
      const response = await http.get(`/literature/import/${id}`);
      dispatch(fetchInitialFormDataSuccess(response.data));
    } catch (error) {
      dispatch(fetchInitialFormDataError(httpErrorToActionPayload(error)));
    }
  };
}
