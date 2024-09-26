import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { userLocalLogin } from '../../actions/user';
import LocalLoginPage from '../components/LocalLoginPage';
import { Credentials } from '../../types';

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLoginFormSubmit(credentials: Credentials) {
    dispatch(userLocalLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LocalLoginPage);
