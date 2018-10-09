import { connect } from 'react-redux';
import { Set } from 'immutable';

import Logo from '../components/Logo';

const stateToProps = state => ({
  userRoles: Set(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps, null)(Logo);
