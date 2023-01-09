import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  assignOwnPapers,
  unassignOwnPapers,
  clearPublicationsUnclaimedSelection,
} from '../../actions/authors';
import AssignOwnProfileAction from '../components/AssignOwnProfileAction';

export const dispatchToProps = (
  dispatch: ActionCreator<Action>,
  {
    recordId,
    disabledAssignAction,
  }: { recordId: number; disabledAssignAction: boolean }
) => ({
  onUnassign({ from }: { from: string }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(setPublicationSelection([recordId], true));
    if (disabledAssignAction) {
      dispatch(setPublicationsClaimedSelection([recordId], true));
    } else {
      dispatch(setPublicationsUnclaimedSelection([recordId], true));
    }
    dispatch(unassignOwnPapers({ from }));
  },

  onAssign({ from, to }: { from: string; to: string }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(setPublicationSelection([recordId], true));
    if (disabledAssignAction) {
      dispatch(setPublicationsClaimedSelection([recordId], true));
    } else {
      dispatch(setPublicationsUnclaimedSelection([recordId], true));
    }
    dispatch(assignOwnPapers({ from, to }));
  },
});

export default connect(null, dispatchToProps)(AssignOwnProfileAction);
