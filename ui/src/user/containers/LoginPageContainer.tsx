import { connect, RootStateOrAny } from 'react-redux';

import LoginPage from '../components/LoginPage';

export const stateToProps = (state: RootStateOrAny) => ({
  previousUrl: state.router.location.previousUrl,
});

export default connect(stateToProps)(LoginPage);
