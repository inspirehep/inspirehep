import { isCancelError } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

export default function generateRecordFetchAction({
  pidType,
  fetchingActionActionType,
  fecthSuccessActionType,
  fetchErrorActionType,
  requestOptions = {},
}) {
  const fetching = recordId => ({
    type: fetchingActionActionType,
    payload: { recordId },
  });

  const fetchSuccess = result => ({
    type: fecthSuccessActionType,
    payload: result,
  });

  const fetchError = error => ({
    type: fetchErrorActionType,
    payload: error,
    meta: { redirectableError: true },
  });

  return recordId => async (dispatch, getState, http) => {
    dispatch(fetching(recordId));
    try {
      const response = await http.get(
        `/${pidType}/${recordId}`,
        requestOptions,
        fetchingActionActionType
      );
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchError(payload));
      }
    }
  };
}
