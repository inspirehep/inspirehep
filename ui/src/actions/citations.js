import {
  CITATIONS_ERROR,
  CITATIONS_SUCCESS,
  CITATIONS_REQUEST,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetching() {
  return {
    type: CITATIONS_REQUEST,
  };
}

function fetchSuccess(result) {
  return {
    type: CITATIONS_SUCCESS,
    payload: result,
  };
}

function fetchError(error) {
  return {
    type: CITATIONS_ERROR,
    payload: error,
  };
}

export default function fetch(pidType, recordId, paginationOptions) {
  return async (dispatch, getState, http) => {
    const { page, pageSize } = paginationOptions;
    dispatch(fetching());
    try {
      const citationsApiUrl = `/${pidType}/${recordId}/citations?page=${page}&size=${pageSize}`;
      const response = await http.get(citationsApiUrl);
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchError(payload));
    }
  };
}
