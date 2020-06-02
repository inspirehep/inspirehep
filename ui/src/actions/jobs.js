import { JOB_REQUEST, JOB_SUCCESS, JOB_ERROR } from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';
import { isCancelError } from '../common/http';

function fetchingJob(recordId) {
  return {
    type: JOB_REQUEST,
    payload: { recordId },
  };
}

function fetchJobSuccess(result) {
  return {
    type: JOB_SUCCESS,
    payload: result,
  };
}

function fetchJobError(error) {
  return {
    type: JOB_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

function fetchJob(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingJob(recordId));
    try {
      const response = await http.get(`/jobs/${recordId}`, {}, 'jobs-detail');
      dispatch(fetchJobSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchJobError(payload));
      }
    }
  };
}

export default fetchJob;
