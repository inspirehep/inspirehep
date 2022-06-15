import { connect } from 'react-redux';

import { setAssignDrawerVisibility, assignPapers } from '../../actions/authors';
import AssignDrawer from '../components/AssignDrawer';

const stateToProps = (state: any) => ({
  visible: state.authors.get('isAssignDrawerVisible'),
  selectedPapers: state.authors.get('publicationSelection')
});

const dispatchToProps = (dispatch: any) => ({
  onDrawerClose() {
    dispatch(setAssignDrawerVisibility(false));
  },

  onAssign({
    from,
    to
  }: any) {
    dispatch(assignPapers({ from, to }));
  }
});

export default connect(stateToProps, dispatchToProps)(AssignDrawer);
