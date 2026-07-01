import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../types';

import { userSignUp } from '../../actions/user';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import SignUpPage from '../components/SignUpPage';

const stateToProps = (state: RootState) => ({
  error: state.user.get('signUpError'),
  loading: state.user.get('isSigningUp'),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSignUp(data: string) {
    dispatch(userSignUp(data));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(convertAllImmutablePropsToJS(SignUpPage));
