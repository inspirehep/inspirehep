import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { userLogout } from '../../../actions/user';
import { holdingpenLogout } from '../../../actions/holdingpen';
import { isCataloger } from '../../authorization';
import HeaderMenu from './HeaderMenu';

const stateToProps = (state: RootStateOrAny) => ({
  loggedIn: state.user.get('loggedIn'),
  loggedInToHoldingpen: state.holdingpen.get('loggedIn'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  profileControlNumber: state.user.getIn(['data', 'profile_control_number']),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLogoutClick() {
    dispatch(userLogout());
  },
  onLogout() {
    dispatch(holdingpenLogout());
  },
});

export default connect(stateToProps, dispatchToProps)(HeaderMenu);
