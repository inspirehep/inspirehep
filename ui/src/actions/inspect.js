import { INSPECT_REQUEST, INSPECT_SUCCESS, INSPECT_ERROR } from './actionTypes';

function fetching(id) {
  return {
    type: INSPECT_REQUEST,
    payload: { id },
  };
}

function fetchSuccess(result) {
  return {
    type: INSPECT_SUCCESS,
    payload: result,
  };
}

function fetchError(error) {
  return {
    type: INSPECT_ERROR,
    payload: error,
  };
}

export default function fetch(id) {
  return async (dispatch, getState, http) => {
    dispatch(fetching(id));
    try {
      const response = await http.get(`/workflows/inspect_merge/${id}`);
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      dispatch(fetchError(error.data));
    }
  };
}
