import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { backofficeLogin } from '../../../actions/backoffice';
import LocalLoginPage from '../../components/LocalLoginPage';
import { Credentials } from '../../../types';

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLoginFormSubmit(credentials: Credentials) {
    dispatch(backofficeLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LocalLoginPage);
