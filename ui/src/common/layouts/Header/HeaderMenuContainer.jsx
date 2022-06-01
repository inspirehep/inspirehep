import { connect } from 'react-redux';

import { userLogout } from '../../../actions/user';
import { isCataloger } from '../../authorization';
import HeaderMenu from './HeaderMenu';

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  profileControlNumber: state.user.getIn(['data', 'profile_control_number']),
});

const dispatchToProps = dispatch => ({
  onLogoutClick() {
    dispatch(userLogout());
  },
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
