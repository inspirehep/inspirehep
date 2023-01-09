import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import {
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../actions/authors';
import AssignDrawer from '../components/AssignDrawer';

const stateToProps = (state: RootStateOrAny) => ({
  visible: state.authors.get('isAssignDrawerVisible'),
  selectedPapers: state.authors.get('publicationSelection'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onDrawerClose() {
    dispatch(setAssignDrawerVisibility(false));
  },

  onAssign({ from, to }: { from: string; to: string }) {
    if (to) {
      dispatch(assignPapers({ from, to }));
    } else {
      dispatch(unassignPapers({ from }));
    }
  },
});

export default connect(stateToProps, dispatchToProps)(AssignDrawer);
