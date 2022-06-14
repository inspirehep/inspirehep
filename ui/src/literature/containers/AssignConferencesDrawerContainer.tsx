// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import {
  setAssignDrawerVisibility,
  assignPapers,
} from '../../actions/literature';
import AssignConferencesDrawer from '../components/AssignConferencesDrawer';

const stateToProps = (state: any) => ({
  visible: state.literature.get('isAssignDrawerVisible'),
  selectedPapers: state.literature.get('literatureSelection')
});

const dispatchToProps = (dispatch: any) => ({
  onDrawerClose() {
    dispatch(setAssignDrawerVisibility(false));
  },

  onAssign(conferenceId: any, conferenceTitle: any) {
    dispatch(assignPapers(conferenceId, conferenceTitle));
  }
});

export default connect(stateToProps, dispatchToProps)(AssignConferencesDrawer);
