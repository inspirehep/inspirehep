import {
  INSTITUTION_REQUEST,
  INSTITUTION_SUCCESS,
  INSTITUTION_ERROR,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS, isCancelError } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

function fetchingInstitution(recordId) {
  return {
    type: INSTITUTION_REQUEST,
    payload: { recordId },
  };
}

function fetchInstitutionSuccess(result) {
  return {
    type: INSTITUTION_SUCCESS,
    payload: result,
  };
}

function fetchInstitutionError(error) {
  return {
    type: INSTITUTION_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

function fetchInstitution(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingInstitution(recordId));
    try {
      const response = await http.get(
        `/institutions/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS,
        'institutions-detail'
      );
      dispatch(fetchInstitutionSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchInstitutionError(payload));
      }
    }
  };
}

export default fetchInstitution;
