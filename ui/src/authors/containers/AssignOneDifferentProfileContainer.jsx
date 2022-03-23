import { connect } from 'react-redux';

import {
  setPublicationSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  assignDifferentProfileClaimedPapers,
  assignDifferentProfileUnclaimedPapers,
  clearPublicationsUnclaimedSelection,
  clearPublicationsCanNotClaimSelection,
  setPublicationsCanNotClaimSelection,
  setPublicationsClaimedSelection,
} from '../../actions/authors';
import AssignOneDifferentProfileAction from '../components/AssignOneDifferentProfileAction';

export const stateToProps = (state) => ({
  currentUserId: Number(state.user.getIn(['data', 'recid'])),
});

export const dispatchToProps = (dispatch, { recordId }) => ({
  onAssignWithoutUnclaimed({ from, to, userCanNotClaimProfile }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(clearPublicationsCanNotClaimSelection());
    if (userCanNotClaimProfile) {
      dispatch(setPublicationsCanNotClaimSelection([recordId], true));
    }
    dispatch(setPublicationSelection([recordId], true));
    dispatch(setPublicationsClaimedSelection([recordId], true));
    dispatch(assignDifferentProfileClaimedPapers({ from, to }));
  },
  onAssignUserCanNotClaim({ from, to }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(clearPublicationsCanNotClaimSelection());

    dispatch(setPublicationSelection([recordId], true));
    dispatch(setPublicationsCanNotClaimSelection([recordId], true));

    dispatch(assignDifferentProfileClaimedPapers({ from, to }));
  },
  onAssignWithoutClaimed({ from, to }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(clearPublicationsCanNotClaimSelection());

    dispatch(setPublicationSelection([recordId], true));
    dispatch(setPublicationsUnclaimedSelection([recordId], true));

    dispatch(assignDifferentProfileUnclaimedPapers({ from, to }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignOneDifferentProfileAction);
