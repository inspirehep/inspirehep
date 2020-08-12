import { connect } from 'react-redux';

import { setAssignDrawerVisibility, assignPapers } from '../../actions/authors';
import AssignDrawer from '../components/AssignDrawer';

const stateToProps = state => ({
  visible: state.authors.get('isAssignDrawerVisible'),
  selectedPapers: state.authors.get('publicationSelection'),
});

const dispatchToProps = dispatch => ({
  onDrawerClose() {
    dispatch(setAssignDrawerVisibility(false));
  },

  onAssign({ from, to }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignDrawer);
