// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import LoginPage from '../components/LoginPage';

export const stateToProps = (state: $TSFixMe) => ({
  previousUrl: state.router.location.previousUrl
});

export default connect(stateToProps)(LoginPage);
