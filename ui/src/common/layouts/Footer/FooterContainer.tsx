// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import Footer from './Footer';
import { isCataloger } from '../../authorization';

const stateToProps = (state: $TSFixMe) => ({
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles']))
});

export default connect(stateToProps)(Footer);
