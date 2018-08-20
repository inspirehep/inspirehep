import { push } from 'react-router-redux';

import {
  AUTHOR_SUBMIT_ERROR,
  AUTHOR_SUBMIT_SUCCESS,
  AUTHOR_UPDATE_FORM_DATA_REQUEST,
  AUTHOR_UPDATE_FORM_DATA_ERROR,
  AUTHOR_UPDATE_FORM_DATA_SUCCESS,
} from './actionTypes';

function authorSubmitSuccess() {
  return {
    type: AUTHOR_SUBMIT_SUCCESS,
  };
}

function authorSubmitError(error) {
  return {
    type: AUTHOR_SUBMIT_ERROR,
    payload: error,
  };
}

export function submitAuthor(data) {
  return async (dispatch, getState, http) => {
    try {
      await http.post('/submissions/author', { data });
      dispatch(authorSubmitSuccess());
      dispatch(push('/submissions/success'));
    } catch (error) {
      dispatch(authorSubmitError(error.response.data));
    }
  };
}

function fetchingAuthorUpdateFormData(recordId) {
  return {
    type: AUTHOR_UPDATE_FORM_DATA_REQUEST,
    payload: { recordId },
  };
}

function fetchAuthorUpdateFormDataError(error) {
  return {
    type: AUTHOR_UPDATE_FORM_DATA_ERROR,
    payload: error,
  };
}

function fetchAuthorUpdateFormDataSuccess(data) {
  return {
    type: AUTHOR_UPDATE_FORM_DATA_SUCCESS,
    payload: data,
  };
}

export function fetchAuthorUpdateFormData(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingAuthorUpdateFormData(recordId));
    try {
      const response = await http.get(`/submissions/author/${recordId}`);
      dispatch(fetchAuthorUpdateFormDataSuccess(response.data));
    } catch (error) {
      dispatch(
        fetchAuthorUpdateFormDataError(error.response && error.response.data)
      );
    }
  };
}

export function submitAuthorUpdate(data, recordId) {
  return async (dispatch, getState, http) => {
    try {
      await http.put(`/submissions/author/${recordId}`, { data });
      dispatch(authorSubmitSuccess());
      dispatch(push('/submissions/success'));
    } catch (error) {
      dispatch(authorSubmitError(error.response && error.response.data));
    }
  };
}
