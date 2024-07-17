import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { holdingpenLogin } from '../../../actions/holdingpen';
import LoginPage from '../../components/LoginPage';
import { Credentials } from '../../../types';

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLoginFormSubmit(credentials: Credentials) {
    dispatch(holdingpenLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LoginPage);
