import { AUTHOR_REQUEST, AUTHOR_SUCCESS, AUTHOR_ERROR } from './actionTypes';

function fetchingAuthor(recordId) {
  return {
    type: AUTHOR_REQUEST,
    payload: { recordId },
  };
}

function fetchAuthorSuccess(result) {
  return {
    type: AUTHOR_SUCCESS,
    payload: result,
  };
}

function fetchAuthorError(error) {
  return {
    type: AUTHOR_ERROR,
    payload: error,
  };
}

export default function fetchAuthor(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingAuthor(recordId));
    try {
      const response = await http.get(`/authors/${recordId}`, {
        headers: {
          Accept: 'application/vnd+inspire.record.ui+json',
        },
      });
      dispatch(fetchAuthorSuccess(response.data));
    } catch (error) {
      dispatch(fetchAuthorError(error.response && error.response.data));
    }
  };
}
