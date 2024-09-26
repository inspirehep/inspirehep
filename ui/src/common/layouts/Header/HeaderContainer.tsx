import { connect, RootStateOrAny } from 'react-redux';

import { SUBMISSIONS, HOME, BACKOFFICE } from '../../routes';
import Header from './Header';

const stateToProps = (state: RootStateOrAny) => ({
  isHomePage: state.router.location.pathname === HOME,
  isBackofficePage: String(state.router.location.pathname).startsWith(
    BACKOFFICE
  ),
  isSubmissionsPage: String(state.router.location.pathname).startsWith(
    SUBMISSIONS
  ),
  isBetaPage: false,
});

export default connect(stateToProps)(Header);
