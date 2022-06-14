// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

export const stateToProps = (state: $TSFixMe) => ({
  currentUserId: Number(state.user.getIn(['data', 'recid']))
});

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    recordId
  }: $TSFixMe
) => ({
  onAssignWithoutUnclaimed({
    from,
    to,
    userCanNotClaimProfile
  }: $TSFixMe) {
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
  }: $TSFixMe) {
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
  }: $TSFixMe) {
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
