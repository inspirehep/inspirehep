import { connect } from 'react-redux';

import { SUBMISSIONS, HOME } from '../../routes';
import Header from './Header';

const stateToProps = state => ({
  isHomePage: state.router.location.pathname === HOME,
  isSubmissionsPage: String(state.router.location.pathname).startsWith(
    SUBMISSIONS
  ),
});

export default connect(stateToProps)(Header);
