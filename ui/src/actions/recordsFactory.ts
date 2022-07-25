import { replace } from 'connected-react-router';
import { Dispatch } from 'redux';
import { RootStateOrAny } from 'react-redux';
import {
  isCancelError,
  UI_SERIALIZER_REQUEST_OPTIONS,
  HttpClientWrapper
} from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

export default function generateRecordFetchAction({
  pidType,
  fetchingActionActionType,
  fecthSuccessActionType,
  fetchErrorActionType,
  requestOptions = UI_SERIALIZER_REQUEST_OPTIONS,
}: {
  pidType: string,
  fetchingActionActionType: string,
  fecthSuccessActionType: string,
  fetchErrorActionType: string,
  requestOptions?: { headers: { Accept: string; }; },
}) {
  const fetching = (recordId: number) => ({
    type: fetchingActionActionType,
    payload: { recordId },
  });

  const fetchSuccess = (result: Record<string, string | number>) => ({
    type: fecthSuccessActionType,
    payload: result,
  });

  const fetchError = (error: { error: Error }) => ({
    type: fetchErrorActionType,
    payload: error,
    meta: { redirectableError: true },
  });

  return (recordId: number) => async (dispatch: Dispatch, getState: () => RootStateOrAny, http: HttpClientWrapper) => {
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
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(fetchError({ error }));
      }
    }
  };
}
