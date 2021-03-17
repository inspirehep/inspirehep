import { connect } from 'react-redux';

import {
  setPublicationSelection,
  clearPulicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
} from '../../actions/authors';
import AssignAction from '../components/AssignAction';

export const dispatchToProps = (dispatch, { recordId }) => ({
  onAssignToAnotherAuthor() {
    dispatch(clearPulicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(setAssignDrawerVisibility(true));
  },

  onAssign({ from, to }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(null, dispatchToProps)(AssignAction);
