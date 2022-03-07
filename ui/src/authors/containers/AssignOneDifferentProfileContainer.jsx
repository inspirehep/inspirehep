import { connect } from 'react-redux';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  assignDifferentProfileClaimedPapers,
  assignDifferentProfileUnclaimedPapers,
  clearPublicationsUnclaimedSelection,
  clearPublicationsCanNotClaimSelection,
  setPublicationsCanNotClaimSelection,
} from '../../actions/authors';
import AssignDiffetentProfileAction from '../components/AssignDifferentProfileAction';

export const stateToProps = (state) => ({
  currentUserId: state.user.getIn(['data', 'recid']),
});

export const dispatchToProps = (
  dispatch,
  { recordId, disabledAssignAction, canClaimDifferentProfile }
) => ({
  onAssign({ from, to }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(clearPublicationsCanNotClaimSelection());
    dispatch(setPublicationSelection([recordId], true));
    if (!canClaimDifferentProfile) {
      dispatch(setPublicationsCanNotClaimSelection([recordId], true));
    }
    if (!disabledAssignAction && canClaimDifferentProfile) {
      dispatch(setPublicationsUnclaimedSelection([recordId], true));
      dispatch(assignDifferentProfileUnclaimedPapers({ from, to }));
    } else {
      dispatch(setPublicationsClaimedSelection([recordId], true));
      dispatch(assignDifferentProfileClaimedPapers({ from, to }));
    }
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignDiffetentProfileAction);
