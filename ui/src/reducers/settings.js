import { fromJS } from 'immutable';

import {
  SETTINGS_CHANGE_EMAIL_ERROR,
  SETTINGS_CHANGE_EMAIL_SUCCESS,
  SETTINGS_CHANGE_EMAIL_REQUEST,
} from '../actions/actionTypes';

export const initialState = fromJS({
  changeEmailError: null,
  changeEmailRequest: false,
});

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SETTINGS_CHANGE_EMAIL_REQUEST:
      return state
        .set('changeEmailRequest', true)
        .set('changeEmailError', initialState.get('changeEmailError'));
    case SETTINGS_CHANGE_EMAIL_ERROR:
      return state
        .set('changeEmailRequest', false)
        .set('changeEmailError', fromJS(action.payload.error));
    case SETTINGS_CHANGE_EMAIL_SUCCESS:
      return state
        .setIn(['data', 'email'], action.payload.value)
        .set('changeEmailError', initialState.get('changeEmailError'))
        .set('changeEmailRequest', false);
    default:
      return state;
  }
};

export default settingsReducer;
