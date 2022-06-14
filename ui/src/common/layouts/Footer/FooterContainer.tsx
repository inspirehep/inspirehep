import { connect } from 'react-redux';

import Footer from './Footer';
import { isCataloger } from '../../authorization';

const stateToProps = state => ({
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(Footer);
