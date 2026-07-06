import { connect } from 'react-redux';
import { RootState } from '../../types';

import LoginPage from '../components/LoginPage';

export const stateToProps = (state: RootState) => ({
  previousUrl: state.router.location.previousUrl,
});

export default connect(stateToProps)(LoginPage);
