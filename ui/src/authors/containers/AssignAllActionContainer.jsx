import { connect } from 'react-redux';

import AssignAction from '../components/AssignAction';
import { setAssignDrawerVisibility, assignPapers } from '../../actions/authors';

const dispatchToProps = dispatch => ({
  onAssignToAnotherAuthor() {
    dispatch(setAssignDrawerVisibility(true));
  },

  onAssign({ from, to }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(null, dispatchToProps)(AssignAction);
