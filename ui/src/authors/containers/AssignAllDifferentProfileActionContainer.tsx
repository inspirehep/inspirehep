// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import AssignDifferentProfileAction from '../components/AssignDifferentProfileAction';
import {
  assignDifferentProfileUnclaimedPapers,
  assignDifferentProfileClaimedPapers,
} from '../../actions/authors';

const stateToProps = (state: $TSFixMe) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  currentUserId: Number(state.user.getIn(['data', 'recid'])),

  claimingUnclaimedPapersDisabled:
    state.authors.get('publicationSelectionUnclaimed').size === 0,

  claimingClaimedPapersDisabled:
    state.authors.get('publicationSelectionClaimed').size === 0 &&
    state.authors.get('publicationSelectionCanNotClaim').size === 0
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  onAssignWithoutUnclaimed({
    from,
    to
  }: $TSFixMe) {
    dispatch(assignDifferentProfileClaimedPapers({ from, to }));
  },

  onAssignWithoutClaimed({
    from,
    to
  }: $TSFixMe) {
    dispatch(assignDifferentProfileUnclaimedPapers({ from, to }));
  }
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignDifferentProfileAction);
