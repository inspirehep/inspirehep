import { RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import {
  DATA_REQUEST,
  DATA_SUCCESS,
  DATA_ERROR,
  DATA_AUTHORS_SUCCESS,
  DATA_AUTHORS_REQUEST,
  DATA_AUTHORS_ERROR,
} from './actionTypes';
import { DATA_PID_TYPE } from '../common/constants';
import { generateRecordFetchAction } from './recordsFactory';
import { HttpClientWrapper, isCancelError } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

const fetchData = generateRecordFetchAction({
  pidType: DATA_PID_TYPE,
  fetchingActionActionType: DATA_REQUEST,
  fetchSuccessActionType: DATA_SUCCESS,
  fetchErrorActionType: DATA_ERROR,
});

export default fetchData;

function fetchingDataAuthors() {
  return {
    type: DATA_AUTHORS_REQUEST,
  };
}

function fetchDataAuthorsSuccess<T>(result: {
  id: string;
  links: Record<string, string>;
  metadata: Record<string, T>;
}) {
  return {
    type: DATA_AUTHORS_SUCCESS,
    payload: result,
  };
}

function fetchDataAuthorsError(errorPayload: { error: Error }) {
  return {
    type: DATA_AUTHORS_ERROR,
    payload: errorPayload,
  };
}

export function fetchDataAuthors(
  recordId: number
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingDataAuthors());
    try {
      const response = await http.get(
        `/data/${recordId}/authors`,
        {},
        'data-authors-detail'
      );
      dispatch(fetchDataAuthorsSuccess(response.data));
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(fetchDataAuthorsError({ error }));
      }
    }
  };
}
