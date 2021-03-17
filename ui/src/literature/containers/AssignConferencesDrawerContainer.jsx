import { connect } from 'react-redux';

import {
  setAssignDrawerVisibility,
  assignPapers,
} from '../../actions/literature';
import AssignConferencesDrawer from '../components/AssignConferencesDrawer';

const stateToProps = (state) => ({
  visible: state.literature.get('isAssignDrawerVisible'),
  selectedPapers: state.literature.get('literatureSelection'),
});

const dispatchToProps = (dispatch) => ({
  onDrawerClose() {
    dispatch(setAssignDrawerVisibility(false));
  },

  onAssign(conferenceId) {
    dispatch(assignPapers(conferenceId));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignConferencesDrawer);
