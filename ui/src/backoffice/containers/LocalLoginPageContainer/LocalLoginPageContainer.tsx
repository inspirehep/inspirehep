import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { backofficeLocalLogin } from '../../../actions/backoffice';
import LocalLoginPage from '../../components/LocalLoginPage';
import { Credentials } from '../../../types';

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLoginFormSubmit(credentials: Credentials) {
    dispatch(backofficeLocalLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LocalLoginPage);
