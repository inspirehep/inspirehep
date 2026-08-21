import { connect } from 'react-redux';
import { goBack } from 'redux-first-history';
import { Action, ActionCreator } from 'redux';

import GoBackLink from '../components/GoBackLink';

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onClick() {
    dispatch(goBack());
  },
});

export default connect(null, dispatchToProps)(GoBackLink);
