import { connect } from 'react-redux';
import { userSignUp } from '../../actions/user';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import SignUpPage from '../components/SignUpPage';

const stateToProps = (state: any) => ({
  error: state.user.get('signUpError'),
  loading: state.user.get('isSigningUp')
});

export const dispatchToProps = (dispatch: any) => ({
  onSubmit(data: any) {
    dispatch(userSignUp(data));
  }
});

export default connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(SignUpPage)
);
