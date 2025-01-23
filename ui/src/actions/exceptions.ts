import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';
import { HttpClientWrapper } from '../common/http';
import {
  EXCEPTIONS_REQUEST,
  EXCEPTIONS_SUCCESS,
  EXCEPTIONS_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function fetching() {
  return {
    type: EXCEPTIONS_REQUEST,
  };
}

function fetchSuccess<T>(result: T) {
  return {
    type: EXCEPTIONS_SUCCESS,
    payload: result,
  };
}

function fetchError(error: { error: Error }) {
  return {
    type: EXCEPTIONS_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

export default function fetch(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetching());
    try {
      const response = await http.get('/migrator/errors');
      dispatch(fetchSuccess(response.data));
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(fetchError({ error }));
    }
  };
}
