import {
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
  CONFERENCE_ERROR,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

function fetchingConference(recordId) {
  return {
    type: CONFERENCE_REQUEST,
    payload: { recordId },
  };
}

function fetchConferenceSuccess(result) {
  return {
    type: CONFERENCE_SUCCESS,
    payload: result,
  };
}

function fetchConferenceError(error) {
  return {
    type: CONFERENCE_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

function fetchConference(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingConference(recordId));
    try {
      const response = await http.get(
        `/conferences/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS
      );
      dispatch(fetchConferenceSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchConferenceError(payload));
    }
  };
}

export default fetchConference;
