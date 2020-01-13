import { connect } from 'react-redux';
import { Set } from 'immutable';

import { isCataloger } from '../../../common/authorization';
import StatusField from '../components/StatusField';

const stateToProps = state => ({
  isCatalogerLoggedIn: isCataloger(Set(state.user.getIn(['data', 'roles']))),
  canModify: state.submissions.getIn(
    ['initialMeta', 'can_modify_status'],
    true
  ),
});

export default connect(stateToProps)(StatusField);
