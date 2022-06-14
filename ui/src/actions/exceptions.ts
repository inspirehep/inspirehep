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

function fetchSuccess(result: $TSFixMe) {
  return {
    type: EXCEPTIONS_SUCCESS,
    payload: result,
  };
}

function fetchError(error: $TSFixMe) {
  return {
    type: EXCEPTIONS_ERROR,
    payload: error,
    meta: { redirectableError: true }
  };
}

export default function fetch() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
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
