import { connect } from 'react-redux';

import AssignAction from '../components/AssignAction';
import { setAssignDrawerVisibility, assignPapers } from '../../actions/authors';

const stateToProps = state => ({
  disabled: state.authors.get('publicationSelection').size === 0,
});

const dispatchToProps = dispatch => ({
  onAssignToAnotherAuthor() {
    dispatch(setAssignDrawerVisibility(true));
  },

  onAssign({ from, to }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignAction);
