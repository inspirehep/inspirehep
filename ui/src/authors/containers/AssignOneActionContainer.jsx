import { connect } from 'react-redux';

import {
  setPublicationSelection,
  clearPublicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../actions/authors';
import AssignAction from '../components/AssignAction';

export const dispatchToProps = (dispatch, { recordId }) => ({
  onAssignToAnotherAuthor() {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(setAssignDrawerVisibility(true));
  },

  onUnassign({ from }) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(unassignPapers({ from }));
  },

  onAssign({ from, to }) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(null, dispatchToProps)(AssignAction);
