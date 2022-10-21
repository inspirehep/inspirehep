import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator, Dispatch } from 'redux';

import AssignOwnProfileAction from '../components/AssignOwnProfileAction';
import { assignOwnPapers, unassignOwnPapers } from '../../actions/authors';

const stateToProps = (state: RootStateOrAny) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  disabledAssignAction:
    state.authors.get('publicationSelectionClaimed').size > 0 &&
    state.authors.get('publicationSelectionUnclaimed').size === 0,
  numberOfSelected: state.authors.get('publicationSelection').size,
  claimingTooltip: 'All selected papers are already claimed',
});

const dispatchToProps = (dispatch: Dispatch | ActionCreator<Action>) => ({
  onAssign({ from, to }: { from: string; to: string }) {
    dispatch(assignOwnPapers({ from, to }));
  },
  onUnassign({ from }: { from: string }) {
    dispatch(unassignOwnPapers({ from }));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignOwnProfileAction);
