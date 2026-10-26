import { Action, ActionCreator } from 'redux';
import { RootState } from '../types';

import { HttpClientWrapper } from '../common/http';
import {
  AUTHORLIST_SUCCESS,
  AUTHORLIST_REQUEST,
  AUTHORLIST_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';

function submitAuthorlistSuccess(payload: {
  warnings: string;
  authors: string;
}) {
  return {
    type: AUTHORLIST_SUCCESS,
    payload,
  };
}

function submitAuthorlistRequest() {
  return {
    type: AUTHORLIST_REQUEST,
  };
}

function submitAuthorlistError(error: { error: Error }) {
  return {
    type: AUTHORLIST_ERROR,
    payload: error,
  };
}

export function submitAuthorlist(
  authorlist: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, _getState, http) => {
    dispatch(submitAuthorlistRequest());
    try {
      const response = await http.post('/editor/authorlist/text', {
        text: authorlist,
      });
      dispatch(submitAuthorlistSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(submitAuthorlistError(errorPayload));
    }
  };
}
