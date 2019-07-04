import { connect } from 'react-redux';
import { Set } from 'immutable';

import { SUBMISSIONS_JOB } from '../../../common/routes';
import { isCataloger } from '../../../common/authorization';
import StatusField from '../components/StatusField';

const stateToProps = state => ({
  isCatalogerLoggedIn: isCataloger(Set(state.user.getIn(['data', 'roles']))),
  isUpdateSubmission: String(state.router.location.pathname).startsWith(
    `${SUBMISSIONS_JOB}/`
  ),
});

export default connect(stateToProps)(StatusField);
