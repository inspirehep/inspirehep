import { connect } from 'react-redux';

import { SUBMISSIONS, HOME, isBetaRoute } from '../../routes';
import Header from './Header';

const stateToProps = state => ({
  isHomePage: state.router.location.pathname === HOME,
  isSubmissionsPage: String(state.router.location.pathname).startsWith(
    SUBMISSIONS
  ),
  isBetaPage: isBetaRoute(String(state.router.location.pathname)),
});

export default connect(stateToProps)(Header);
