import { connect } from 'react-redux';
import LoginPage from '../components/LoginPage';

export const stateToProps = state => ({
  previousUrl: state.router.location.previousUrl,
});

export default connect(stateToProps)(LoginPage);
