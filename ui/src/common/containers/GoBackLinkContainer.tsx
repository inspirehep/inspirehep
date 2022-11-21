import { connect } from 'react-redux';
import { goBack } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';

import GoBackLink from '../components/GoBackLink';

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onClick() {
    dispatch(goBack());
  },
});

export default connect(null, dispatchToProps)(GoBackLink);
