import { connect, RootStateOrAny } from 'react-redux';

import { SUBMISSIONS, HOME } from '../../routes';
import Header from './Header';

const stateToProps = (state: RootStateOrAny) => ({
  isHomePage: state.router.location.pathname === HOME,
  isSubmissionsPage: String(state.router.location.pathname).startsWith(
    SUBMISSIONS
  ),
  isBetaPage: false,
});

export default connect(stateToProps)(Header);
