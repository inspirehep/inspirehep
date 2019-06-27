import { connect } from 'react-redux';

import { userLocalLogin } from '../../actions/user';
import LocalLoginPage from '../components/LocalLoginPage';

const dispatchToProps = dispatch => ({
  onLoginFormSubmit(credentials) {
    dispatch(userLocalLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LocalLoginPage);
