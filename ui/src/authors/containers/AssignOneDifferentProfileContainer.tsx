import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator, Dispatch } from 'redux';

import {
  setPublicationSelection,
  clearPublicationSelection,
  assignDifferentProfile,
} from '../../actions/authors';
import AssignOneDifferentProfileAction from '../components/AssignOneDifferentProfileAction';

export const stateToProps = (state: RootStateOrAny) => ({
  currentUserId: Number(state.user.getIn(['data', 'recid'])),
});

export const dispatchToProps = (
  dispatch: Dispatch | ActionCreator<Action>,
  { recordId }: { recordId: number }
) => ({
  onAssign({ from, to }: { from: string; to: string }) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(assignDifferentProfile({ from, to }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignOneDifferentProfileAction);
