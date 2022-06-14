// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { userSignUp } from '../../actions/user';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';
import SignUpPage from '../components/SignUpPage';

const stateToProps = (state: $TSFixMe) => ({
  error: state.user.get('signUpError'),
  loading: state.user.get('isSigningUp')
});

export const dispatchToProps = (dispatch: $TSFixMe) => ({
  onSubmit(data: $TSFixMe) {
    dispatch(userSignUp(data));
  }
});

export default connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(SignUpPage)
);
