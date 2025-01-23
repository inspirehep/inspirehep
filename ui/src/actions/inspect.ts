import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';
import { HttpClientWrapper } from '../common/http';
import { INSPECT_REQUEST, INSPECT_SUCCESS, INSPECT_ERROR } from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetching(id: number) {
  return {
    type: INSPECT_REQUEST,
    payload: { id },
  };
}

function fetchSuccess<T>(result: T) {
  return {
    type: INSPECT_SUCCESS,
    payload: result,
  };
}

function fetchError(error: { error: Error }) {
  return {
    type: INSPECT_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

export default function fetch(
  id: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetching(id));
    try {
      const response = await http.get(`/workflows/inspect_merge/${id}`);
      dispatch(fetchSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(fetchError(errorPayload));
    }
  };
}
