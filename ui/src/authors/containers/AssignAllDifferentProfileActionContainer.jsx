import { connect } from 'react-redux';

import AssignDifferentProfileAction from '../components/AssignDifferentProfileAction';
import { assignDifferentProfile } from '../../actions/authors';

const stateToProps = (state) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  currentUserId: Number(state.user.getIn(['data', 'recid'])),
});

const dispatchToProps = (dispatch) => ({
  onAssign({ from, to }) {
    dispatch(assignDifferentProfile({ from, to }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignDifferentProfileAction);
