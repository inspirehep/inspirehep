import { connect } from 'react-redux';
import { Action, ActionCreator, Dispatch } from 'redux';

import {
  setPublicationSelection,
  clearPublicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
  unassignPapers,
} from '../../actions/authors';
import AssignAction from '../components/AssignAction';

export const dispatchToProps = (
  dispatch: Dispatch | ActionCreator<Action>,
  { recordId }: { recordId: number }
) => ({
  onAssignToAnotherAuthor() {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(setAssignDrawerVisibility(true));
  },

  onUnassign({ from }: { from: string }) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(unassignPapers({ from }));
  },

  onAssign({ from, to }: { from: string; to: string }) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(assignPapers({ from, to }));
  },
});

export default connect(null, dispatchToProps)(AssignAction);
