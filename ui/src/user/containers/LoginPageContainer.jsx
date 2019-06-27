import { connect } from 'react-redux';

import { userLogin } from '../../actions/user';
import LoginPage from '../components/LoginPage';

export const dispatchToProps = dispatch => ({
  onLoginClick() {
    dispatch(userLogin());
  },
});

export default connect(null, dispatchToProps)(LoginPage);
