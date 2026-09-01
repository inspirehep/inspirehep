import { legacy_connect as connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../types';

import AssignAction from '../components/AssignAction';
import {
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../actions/authors';

const stateToProps = (state: RootState) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  numberOfSelected: state.authors.get('publicationSelection').size,
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onAssignToAnotherAuthor() {
    dispatch(setAssignDrawerVisibility(true));
  },

  onUnassign({ from }: { from: string }) {
    dispatch(unassignPapers({ from }));
  },

  onAssign({ from, to }: { from: string; to: string }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignAction);
