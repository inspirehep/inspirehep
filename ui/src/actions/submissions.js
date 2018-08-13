import { push } from 'react-router-redux';

import { SUBMIT_ERROR, SUBMIT_SUCCESS } from './actionTypes';

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

function submit(pidType, data) {
  return async (dispatch, getState, http) => {
    try {
      await http.post(`/submissions/${pidType}`, { data });
      dispatch(submitSuccess());
      dispatch(push('/submissions/success'));
    } catch (error) {
      dispatch(submitError(error.response.data));
    }
  };
}

// eslint-disable-next-line import/prefer-default-export
export function submitAuthor(data) {
  return submit('author', data);
}
