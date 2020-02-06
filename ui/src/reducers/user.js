import { fromJS } from 'immutable';

import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SIGN_UP_REQUEST,
  USER_SIGN_UP_SUCCESS,
  USER_SIGN_UP_ERROR,
  USER_SET_PREFERRED_CITE_FORMAT,
  USER_SET_ORCID_PUSH_SETTING_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_ERROR,
  USER_SET_ORCID_PUSH_SETTING_SUCCESS,
} from '../actions/actionTypes';
import { CITE_FORMAT_VALUES } from '../literature/constants';

export const initialState = fromJS({
  loggedIn: false,
  isSigningUp: false,
  signUpError: null,
  isUpdatingOrcidPushSetting: false,
  updateOrcidPushSettingError: null,
  preferredCiteFormat: CITE_FORMAT_VALUES[0],
  data: {
    roles: [],
    orcid: null,
  },
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGN_UP_REQUEST:
      return state
        .set('isSigningUp', true)
        .set('signUpError', initialState.get('signUpError'));
    case USER_SIGN_UP_ERROR:
      return state
        .set('signUpError', fromJS(action.payload.error))
        .set('isSigningUp', initialState.get('isSigningUp'));
    case USER_LOGIN_ERROR:
    case USER_LOGOUT_SUCCESS:
      return state
        .set('loggedIn', false)
        .set('data', initialState.get('data'))
        .set('isSigningUp', initialState.get('isSigningUp'));
    case USER_LOGIN_SUCCESS:
    case USER_SIGN_UP_SUCCESS:
      return state
        .set('loggedIn', true)
        .set('signUpError', initialState.get('signUpError'))
        .set('isSigningUp', initialState.get('isSigningUp'))
        .set('data', fromJS(action.payload.data));
    case USER_SET_PREFERRED_CITE_FORMAT:
      return state.set('preferredCiteFormat', action.payload.format);
    case USER_SET_ORCID_PUSH_SETTING_REQUEST:
      return state
        .set('isUpdatingOrcidPushSetting', true)
        .set(
          'updateOrcidPushSettingError',
          initialState.get('updateOrcidPushSettingError')
        );
    case USER_SET_ORCID_PUSH_SETTING_ERROR:
      return state
        .set('isUpdatingOrcidPushSetting', false)
        .set('updateOrcidPushSettingError', fromJS(action.payload.error));
    case USER_SET_ORCID_PUSH_SETTING_SUCCESS:
      return state
        .set('isUpdatingOrcidPushSetting', false)
        .setIn(['data', 'allow_orcid_push'], action.payload.value)
        .set(
          'updateOrcidPushSettingError',
          initialState.get('updateOrcidPushSettingError')
        );
    default:
      return state;
  }
};

export default userReducer;
