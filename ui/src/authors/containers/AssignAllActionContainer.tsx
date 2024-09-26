import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import AssignAction from '../components/AssignAction';
import {
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../actions/authors';

const stateToProps = (state: RootStateOrAny) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  numberOfSelected: state.authors.get('publicationSelection').size,
  claimingTooltip: 'All selected papers are already claimed',
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onAssignToAnotherAuthor() {
    dispatch(setAssignDrawerVisibility(true));
  },

  onUnassign({ from }: { from: string }) {
    dispatch(unassignPapers({ from }));
  },

  onAssign({ from, to }: { from: string, to: string }) {
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignAction);
