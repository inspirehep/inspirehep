import { connect } from 'react-redux';

import { userLogout } from '../../../actions/user';
import HeaderMenu from './HeaderMenu';

const stateToProps = state => ({
  loggedIn: state.user.get('loggedIn'),
});

const dispatchToProps = dispatch => ({
  onLogoutClick() {
    dispatch(userLogout());
  },
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
