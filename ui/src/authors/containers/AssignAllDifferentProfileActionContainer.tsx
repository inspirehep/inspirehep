import { connect } from 'react-redux';

import AssignDifferentProfileAction from '../components/AssignDifferentProfileAction';
import {
  assignDifferentProfileUnclaimedPapers,
  assignDifferentProfileClaimedPapers,
} from '../../actions/authors';

const stateToProps = (state: any) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  currentUserId: Number(state.user.getIn(['data', 'recid'])),

  claimingUnclaimedPapersDisabled:
    state.authors.get('publicationSelectionUnclaimed').size === 0,

  claimingClaimedPapersDisabled:
    state.authors.get('publicationSelectionClaimed').size === 0 &&
    state.authors.get('publicationSelectionCanNotClaim').size === 0
});

const dispatchToProps = (dispatch: any) => ({
  onAssignWithoutUnclaimed({
    from,
    to
  }: any) {
    dispatch(assignDifferentProfileClaimedPapers({ from, to }));
  },

  onAssignWithoutClaimed({
    from,
    to
  }: any) {
    dispatch(assignDifferentProfileUnclaimedPapers({ from, to }));
  }
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignDifferentProfileAction);
