import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { changeEmailAddress } from '../../actions/settings';
import { Credentials } from '../../types';
import SettingsPage from '../components/SettingsPage';

const stateToProps = (state: RootStateOrAny) => ({
  error: state.settings.get('changeEmailError'),
  loading: state.settings.get('changeEmailRequest'),
  profileControlNumber: state.user.getIn(['data', 'profile_control_number']),
  userOrcid: state.user.getIn(['data', 'orcid']),
  userEmail: state.user.getIn(['data', 'email']),
});


const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onChangeEmailAddress(email: Credentials) {
    dispatch(changeEmailAddress(email));
  },
});

export default connect(stateToProps, dispatchToProps)(SettingsPage);
