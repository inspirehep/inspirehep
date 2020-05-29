import {
  EXPERIMENT_REQUEST,
  EXPERIMENT_SUCCESS,
  EXPERIMENT_ERROR,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { EXPERIMENTS_PID_TYPE } from '../common/constants';

function fetchingExperiment(recordId) {
  return {
    type: EXPERIMENT_REQUEST,
    payload: { recordId },
  };
}

function fetchExperimentSuccess(result) {
  return {
    type: EXPERIMENT_SUCCESS,
    payload: result,
  };
}

function fetchExperimentError(error) {
  return {
    type: EXPERIMENT_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

function fetchExperiment(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingExperiment(recordId));
    try {
      const response = await http.get(
        `/${EXPERIMENTS_PID_TYPE}/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS
      );
      dispatch(fetchExperimentSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchExperimentError(payload));
    }
  };
}

export default fetchExperiment;
