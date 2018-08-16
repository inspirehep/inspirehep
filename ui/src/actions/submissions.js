import { push } from 'react-router-redux';

import { AUTHOR_SUBMIT_ERROR, AUTHOR_SUBMIT_SUCCESS } from './actionTypes';

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

// eslint-disable-next-line import/prefer-default-export
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
