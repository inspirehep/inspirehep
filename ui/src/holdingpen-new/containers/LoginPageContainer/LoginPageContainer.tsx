import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { holdingpenLogin } from '../../../actions/holdingpen';
import LocalLoginPage from '../../components/LocalLoginPage';
import { Credentials } from '../../../types';

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onLoginFormSubmit(credentials: Credentials) {
    dispatch(holdingpenLogin(credentials));
  },
});

export default connect(null, dispatchToProps)(LocalLoginPage);
