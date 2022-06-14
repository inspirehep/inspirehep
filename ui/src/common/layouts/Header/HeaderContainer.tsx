// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { SUBMISSIONS, HOME, isBetaRoute } from '../../routes';
import Header from './Header';

const stateToProps = (state: any) => ({
  isHomePage: state.router.location.pathname === HOME,

  isSubmissionsPage: String(state.router.location.pathname).startsWith(
    SUBMISSIONS
  ),

  isBetaPage: isBetaRoute(String(state.router.location.pathname))
});

export default connect(stateToProps)(Header);
