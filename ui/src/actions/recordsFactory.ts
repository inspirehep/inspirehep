import { replace } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';

import {
  isCancelError,
  UI_SERIALIZER_REQUEST_OPTIONS,
  HttpClientWrapper,
} from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

export function generateRecordFetchAction({
  pidType,
  fetchingActionActionType,
  fetchSuccessActionType,
  fetchErrorActionType,
  requestOptions = UI_SERIALIZER_REQUEST_OPTIONS,
}: {
  pidType: string;
  fetchingActionActionType: string;
  fetchSuccessActionType: string;
  fetchErrorActionType: string;
  requestOptions?: { headers: { Accept: string } };
}) {
  const fetching = (recordId: number) => ({
    type: fetchingActionActionType,
    payload: { recordId },
  });

  const fetchSuccess = (result: Record<string, string | number>) => ({
    type: fetchSuccessActionType,
    payload: result,
  });

  const fetchError = (error: { error: Error }) => ({
    type: fetchErrorActionType,
    payload: error,
    meta: { redirectableError: true },
  });

  return (recordId: number) =>
    async (
      dispatch: ActionCreator<Action>,
      getState: () => RootStateOrAny,
      http: HttpClientWrapper
    ) => {
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
