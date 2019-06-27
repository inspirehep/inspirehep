import { connect } from 'react-redux';
import { Set } from 'immutable';

import { userLogout } from '../../../actions/user';
import HeaderMenu from './HeaderMenu';

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

const dispatchToProps = dispatch => ({
  onLogoutClick() {
    dispatch(userLogout());
  },
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
