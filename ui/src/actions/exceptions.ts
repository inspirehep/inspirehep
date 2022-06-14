import {
  EXCEPTIONS_REQUEST,
  EXCEPTIONS_SUCCESS,
  EXCEPTIONS_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetching() {
  return {
    type: EXCEPTIONS_REQUEST,
  };
}

function fetchSuccess(result) {
  return {
    type: EXCEPTIONS_SUCCESS,
    payload: result,
  };
}

function fetchError(error) {
  return {
    type: EXCEPTIONS_ERROR,
    payload: error,
    meta: { redirectableError: true }
  };
}

export default function fetch() {
  return async (dispatch, getState, http) => {
    dispatch(fetching());
    try {
      const response = await http.get('/migrator/errors');
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error)
      dispatch(fetchError(errorPayload));
    }
  };
}
