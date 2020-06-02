import { AUTHOR_REQUEST, AUTHOR_SUCCESS, AUTHOR_ERROR } from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS, isCancelError } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

function fetchingAuthor(recordId) {
  return {
    type: AUTHOR_REQUEST,
    payload: { recordId },
  };
}

function fetchAuthorSuccess(result) {
  return {
    type: AUTHOR_SUCCESS,
    payload: result,
  };
}

function fetchAuthorError(error) {
  return {
    type: AUTHOR_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

export function fetchAuthor(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingAuthor(recordId));
    try {
      const response = await http.get(
        `/authors/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS,
        'authors-detail'
      );
      dispatch(fetchAuthorSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchAuthorError(payload));
      }
    }
  };
}
