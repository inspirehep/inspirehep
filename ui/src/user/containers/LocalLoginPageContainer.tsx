import { connect } from 'react-redux';

import { userLocalLogin } from '../../actions/user';
import LocalLoginPage from '../components/LocalLoginPage';

const dispatchToProps = (dispatch: any) => ({
  onLoginFormSubmit(credentials: any) {
    dispatch(userLocalLogin(credentials));
  }
});

export default connect(null, dispatchToProps)(LocalLoginPage);
