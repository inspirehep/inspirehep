import { connect, RootStateOrAny } from 'react-redux';

import { SUBMISSIONS, HOME, HOLDINGPEN_NEW } from '../../routes';
import Header from './Header';

const stateToProps = (state: RootStateOrAny) => ({
  isHomePage: state.router.location.pathname === HOME,
  isHoldingpenPage: String(state.router.location.pathname).startsWith(
    HOLDINGPEN_NEW
  ),
  isSubmissionsPage: String(state.router.location.pathname).startsWith(
    SUBMISSIONS
  ),
  isBetaPage: false,
});

export default connect(stateToProps)(Header);
