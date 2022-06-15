import { connect } from 'react-redux';

import { userLogout } from '../../../actions/user';
import { isCataloger } from '../../authorization';
import HeaderMenu from './HeaderMenu';

const stateToProps = (state: any) => ({
  loggedIn: state.user.get('loggedIn'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  profileControlNumber: state.user.getIn(['data', 'profile_control_number'])
});

const dispatchToProps = (dispatch: any) => ({
  onLogoutClick() {
    dispatch(userLogout());
  }
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
