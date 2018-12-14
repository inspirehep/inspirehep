import { push } from 'react-router-redux';

import {
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_ERROR,
  INITIAL_FORM_DATA_SUCCESS,
} from './actionTypes';

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

export function submitAuthor(data) {
  return async (dispatch, getState, http) => {
    try {
      await http.post('/submissions/authors', { data });
      dispatch(submitSuccess());
      dispatch(push('/submissions/success'));
    } catch (error) {
      dispatch(submitError(error.response.data));
    }
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

export function fetchAuthorUpdateFormData(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingInitialFormData({ recordId, pidType: 'authors' }));
    try {
      const response = await http.get(`/submissions/authors/${recordId}`);
      dispatch(fetchInitialFormDataSuccess(response.data));
    } catch (error) {
      dispatch(
        fetchInitialFormDataError(error.response && error.response.data)
      );
    }
  };
}

export function submitAuthorUpdate(data, recordId) {
  return async (dispatch, getState, http) => {
    try {
      await http.put(`/submissions/authors/${recordId}`, { data });
      dispatch(submitSuccess());
      dispatch(push('/submissions/success'));
    } catch (error) {
      dispatch(submitError(error.response && error.response.data));
    }
  };
}
