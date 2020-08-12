import { connect } from 'react-redux';

import {
  setPulicationSelection,
  clearPulicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
} from '../../actions/authors';
import AssignAction from '../components/AssignAction';

export const dispatchToProps = (dispatch, { recordId }) => ({
  onAssignToAnotherAuthor() {
    dispatch(clearPulicationSelection());
    dispatch(setPulicationSelection([recordId], true));
    dispatch(setAssignDrawerVisibility(true));
  },

  onAssign({ from, to }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(null, dispatchToProps)(AssignAction);
