import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../../types';

import { userLogout } from '../../../actions/user';
import { backofficeLogout } from '../../../actions/backoffice';
import { isCataloger } from '../../authorization';
import HeaderMenu from './HeaderMenu';

const stateToProps = (state: RootState) => ({
  loggedIn: state.user.get('loggedIn'),
  loggedInToBackoffice: state.backoffice.get('loggedIn'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  profileControlNumber: state.user.getIn(['data', 'profile_control_number']),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLogoutClick() {
    dispatch(userLogout());
  },
  onBackofficeLogoutClick() {
    dispatch(backofficeLogout());
  },
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
