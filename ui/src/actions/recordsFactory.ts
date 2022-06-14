import { replace } from 'connected-react-router';
import {
  isCancelError,
  UI_SERIALIZER_REQUEST_OPTIONS,
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
} from '../common/http.ts';
import { httpErrorToActionPayload } from '../common/utils';

export default function generateRecordFetchAction({
  pidType,
  fetchingActionActionType,
  fecthSuccessActionType,
  fetchErrorActionType,
  requestOptions = UI_SERIALIZER_REQUEST_OPTIONS
}: any) {
  const fetching = (recordId: any) => ({
    type: fetchingActionActionType,
    payload: { recordId }
  });

  const fetchSuccess = (result: any) => ({
    type: fecthSuccessActionType,
    payload: result
  });

  const fetchError = (error: any) => ({
    type: fetchErrorActionType,
    payload: error,
    meta: { redirectableError: true }
  });

  return (recordId: any) => async (dispatch: any, getState: any, http: any) => {
    dispatch(fetching(recordId));
    try {
      const response = await http.get(
        `/${pidType}/${recordId}`,
        requestOptions,
        fetchingActionActionType
      );

      const { responseURL } = response.request;
      if (responseURL.endsWith(recordId)) {
        dispatch(fetchSuccess(response.data));
      } else {
        // REDIRECT
        const parts = responseURL.split('/');
        const redirectedId = parts[parts.length - 1];
        dispatch(replace(`/${pidType}/${redirectedId}`));
      }
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchError(payload));
      }
    }
  };
}
