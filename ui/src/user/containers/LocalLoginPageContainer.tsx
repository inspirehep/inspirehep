// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { userLocalLogin } from '../../actions/user';
import LocalLoginPage from '../components/LocalLoginPage';

const dispatchToProps = (dispatch: any) => ({
  onLoginFormSubmit(credentials: any) {
    dispatch(userLocalLogin(credentials));
  }
});

export default connect(null, dispatchToProps)(LocalLoginPage);
