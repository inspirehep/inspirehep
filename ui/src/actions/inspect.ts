import { INSPECT_REQUEST, INSPECT_SUCCESS, INSPECT_ERROR } from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetching(id: any) {
  return {
    type: INSPECT_REQUEST,
    payload: { id },
  };
}

function fetchSuccess(result: any) {
  return {
    type: INSPECT_SUCCESS,
    payload: result,
  };
}

function fetchError(error: any) {
  return {
    type: INSPECT_ERROR,
    payload: error,
    meta: { redirectableError: true }
  };
}

export default function fetch(id: any) {
  return async (dispatch: any, getState: any, http: any) => {
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
