import { INSPECT_REQUEST, INSPECT_SUCCESS, INSPECT_ERROR } from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetching(id: $TSFixMe) {
  return {
    type: INSPECT_REQUEST,
    payload: { id },
  };
}

function fetchSuccess(result: $TSFixMe) {
  return {
    type: INSPECT_SUCCESS,
    payload: result,
  };
}

function fetchError(error: $TSFixMe) {
  return {
    type: INSPECT_ERROR,
    payload: error,
    meta: { redirectableError: true }
  };
}

export default function fetch(id: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    dispatch(fetching(id));
    try {
      const response = await http.get(`/workflows/inspect_merge/${id}`);
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(fetchError(errorPayload));
    }
  };
}
