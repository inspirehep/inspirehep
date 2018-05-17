import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
} from './actionTypes';

function fetching() {
  return {
    type: LITERATURE_REQUEST,
  };
}

function fetchSuccess(result) {
  return {
    type: LITERATURE_SUCCESS,
    payload: result,
  };
}

function fetchError(error) {
  return {
    type: LITERATURE_ERROR,
    payload: error,
  };
}

export default function fetch(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetching());
    try {
      const response = await http.get(`/literature/${recordId}`);
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      dispatch(fetchError(error.data));
    }
  };
}
