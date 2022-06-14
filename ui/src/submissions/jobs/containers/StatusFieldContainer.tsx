// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { isCataloger } from '../../../common/authorization';
import StatusField from '../components/StatusField';

const stateToProps = (state: any) => ({
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),

  canModify: state.submissions.getIn(
    ['initialMeta', 'can_modify_status'],
    true
  )
});

export default connect(stateToProps)(StatusField);
