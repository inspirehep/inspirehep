import { connect } from 'react-redux';

import {
  setPublicationSelection,
  clearPublicationSelection,
  assignDifferentProfile,
} from '../../actions/authors';
import AssignOneDifferentProfileAction from '../components/AssignOneDifferentProfileAction';

export const stateToProps = (state) => ({
  currentUserId: Number(state.user.getIn(['data', 'recid'])),
});

export const dispatchToProps = (dispatch, { recordId }) => ({
  onAssign({ from, to }) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(assignDifferentProfile({ from, to }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignOneDifferentProfileAction);
