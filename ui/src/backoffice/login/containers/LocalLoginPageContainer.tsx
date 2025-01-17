import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { backofficeLocalLogin } from '../../../actions/backoffice';
import { Credentials } from '../../../types';
import LocalLoginPage from '../components/LocalLoginPage';

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLoginFormSubmit(credentials: Credentials) {
    dispatch(backofficeLocalLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LocalLoginPage);
