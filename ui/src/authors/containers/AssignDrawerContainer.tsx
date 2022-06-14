// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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
