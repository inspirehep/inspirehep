// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { userLogout } from '../../../actions/user';
import { isCataloger } from '../../authorization';
import HeaderMenu from './HeaderMenu';

const stateToProps = (state: $TSFixMe) => ({
  loggedIn: state.user.get('loggedIn'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  profileControlNumber: state.user.getIn(['data', 'profile_control_number'])
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  onLogoutClick() {
    dispatch(userLogout());
  }
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
