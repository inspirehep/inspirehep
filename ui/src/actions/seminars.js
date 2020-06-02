import { SEMINAR_REQUEST, SEMINAR_SUCCESS, SEMINAR_ERROR } from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS, isCancelError } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { SEMINARS_PID_TYPE } from '../common/constants';

function fetchingSeminar(recordId) {
  return {
    type: SEMINAR_REQUEST,
    payload: { recordId },
  };
}

function fetchSeminarSuccess(result) {
  return {
    type: SEMINAR_SUCCESS,
    payload: result,
  };
}

function fetchSeminarError(error) {
  return {
    type: SEMINAR_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

function fetchSeminar(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingSeminar(recordId));
    try {
      const response = await http.get(
        `/${SEMINARS_PID_TYPE}/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS,
        'seminars-detail'
      );
      dispatch(fetchSeminarSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchSeminarError(payload));
      }
    }
  };
}

export default fetchSeminar;
