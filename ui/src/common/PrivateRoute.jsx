import { connect } from 'react-redux';

import RouteOrRedirect from './components/RouteOrRedirect';

const stateToProps = state => ({
  condition: state.user.get('loggedIn'),
  redirectTo: '/user/login',
});

export default connect(stateToProps)(RouteOrRedirect);
