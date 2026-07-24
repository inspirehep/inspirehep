import { fromJS } from 'immutable';

import {
  USER_LOGIN_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_SUCCESS,
  USER_SIGN_UP_REQUEST,
  USER_SIGN_UP_SUCCESS,
  USER_SIGN_UP_ERROR,
  LOGGED_IN_USER_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_REQUEST,
  USER_SET_ORCID_PUSH_SETTING_ERROR,
  USER_SET_ORCID_PUSH_SETTING_SUCCESS,
  USER_SET_PREFERENCE,
} from '../actions/actionTypes';
import { CITE_FORMAT_VALUES } from '../literature/constants';
import { BACKOFFICE_AUTHORS_SEARCH_NS } from '../search/constants';

export const CITE_FORMAT_PREFERENCE = 'preferredCiteFormat@V2';
export const CITATION_SUMMARY_ENABLING_PREFERENCE =
  'preferredCitationSummaryEnabling';
export const EXCLUDE_SELF_CITATIONS_PREFERENCE = 'excludeSelfCitations';
export const BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE =
  'backofficeStatusGroupsCollapse';
export const BACKOFFICE_SEARCH_OPTION_PREFERENCE = 'backofficeSearchOption';

export const initialState = fromJS({
  loggedIn: false,
  // true until the initial `fetchLoggedInUser` (/accounts/me) call resolves, so
  // that guarded routes can wait instead of redirecting to login prematurely.
  isFetchingLoggedInUser: true,
  isSigningUp: false,
  signUpError: null,
  isUpdatingOrcidPushSetting: false,
  updateOrcidPushSettingError: null,
  preferences: {
    [CITE_FORMAT_PREFERENCE]: CITE_FORMAT_VALUES[0],
    [CITATION_SUMMARY_ENABLING_PREFERENCE]: false,
    [EXCLUDE_SELF_CITATIONS_PREFERENCE]: false,
    [BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE]: {},
    [BACKOFFICE_SEARCH_OPTION_PREFERENCE]: BACKOFFICE_AUTHORS_SEARCH_NS,
  },
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
    case LOGGED_IN_USER_REQUEST:
      return state.set('isFetchingLoggedInUser', true);
    case USER_LOGIN_ERROR:
    case USER_LOGOUT_SUCCESS:
      return state
        .set('loggedIn', false)
        .set('isFetchingLoggedInUser', false)
        .set('data', initialState.get('data'))
        .set('isSigningUp', initialState.get('isSigningUp'));
    case USER_LOGIN_SUCCESS:
    case USER_SIGN_UP_SUCCESS:
      return state
        .set('loggedIn', true)
        .set('isFetchingLoggedInUser', false)
        .set('signUpError', initialState.get('signUpError'))
        .set('isSigningUp', initialState.get('isSigningUp'))
        .set('data', fromJS(action.payload.data));
    case USER_SET_PREFERENCE:
      return state.setIn(
        ['preferences', action.payload.name],
        action.payload.value
      );
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
