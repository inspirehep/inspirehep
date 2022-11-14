import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator, Dispatch } from 'redux';

import { userSignUp } from '../../actions/user';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import SignUpPage from '../components/SignUpPage';

const stateToProps = (state: RootStateOrAny) => ({
  error: state.user.get('signUpError'),
  loading: state.user.get('isSigningUp'),
});

export const dispatchToProps = (
  dispatch: Dispatch | ActionCreator<Action>
) => ({
  onSubmit(data: string) {
    dispatch(userSignUp(data));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(convertAllImmutablePropsToJS(SignUpPage));
