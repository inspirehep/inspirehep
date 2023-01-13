import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';
import { notification } from 'antd';

import { HttpClientWrapper } from '../common/http';
import {
  SETTINGS_CHANGE_EMAIL_REQUEST,
  SETTINGS_CHANGE_EMAIL_SUCCESS,
  SETTINGS_CHANGE_EMAIL_ERROR
} from './actionTypes';
import { HOME } from '../common/routes';
import { httpErrorToActionPayload } from '../common/utils';
import { Credentials } from '../types';

function changeEmailAddressRequest() {
  return {
    type: SETTINGS_CHANGE_EMAIL_REQUEST,
  };
}

export function changeEmailAddressSuccess(value: string) {
  return {
    type: SETTINGS_CHANGE_EMAIL_SUCCESS,
    payload: value,
  };
}

function changeEmailAddressError(error: { error: Error }) {
  return {
    type: SETTINGS_CHANGE_EMAIL_ERROR,
    payload: error,
  };
}

function notifyEmailChangeSuccesss() {
  notification.success({
    message: 'Success',
    duration: null,
    description: 'Email address changed successfully!',
  });
}

export function changeEmailAddress(credentials: Credentials): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(changeEmailAddressRequest());
    try {
      const response = await http.post('/accounts/settings/update-email', { new_email: credentials.email });
      dispatch(changeEmailAddressSuccess(response.data));
      notifyEmailChangeSuccesss();
    } catch (err) {
      const { error } = httpErrorToActionPayload(err);
      dispatch(changeEmailAddressError({ error }));
    }
  };
}
