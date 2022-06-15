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

export const stateToProps = (state: any) => ({
  currentUserId: Number(state.user.getIn(['data', 'recid']))
});

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    recordId
  }: any
) => ({
  onAssignWithoutUnclaimed({
    from,
    to,
    userCanNotClaimProfile
  }: any) {
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

  onAssignUserCanNotClaim({
    from,
    to
  }: any) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(clearPublicationsCanNotClaimSelection());

    dispatch(setPublicationSelection([recordId], true));
    dispatch(setPublicationsCanNotClaimSelection([recordId], true));

    dispatch(assignDifferentProfileClaimedPapers({ from, to }));
  },

  onAssignWithoutClaimed({
    from,
    to
  }: any) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(clearPublicationsCanNotClaimSelection());

    dispatch(setPublicationSelection([recordId], true));
    dispatch(setPublicationsUnclaimedSelection([recordId], true));

    dispatch(assignDifferentProfileUnclaimedPapers({ from, to }));
  }
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignOneDifferentProfileAction);
