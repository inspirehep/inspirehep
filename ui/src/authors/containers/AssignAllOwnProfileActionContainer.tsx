import { connect } from 'react-redux';

import AssignOwnProfileAction from '../components/AssignOwnProfileAction';
import { assignOwnPapers } from '../../actions/authors';

const stateToProps = (state: any) => ({
  disabled: state.authors.get('publicationSelection').size === 0,

  disabledAssignAction:
    state.authors.get('publicationSelectionClaimed').size > 0 &&
    state.authors.get('publicationSelectionUnclaimed').size === 0,

  numberOfSelected: state.authors.get('publicationSelection').size,
  claimingTooltip: 'All selected papers are already claimed'
});

const dispatchToProps = (dispatch: any) => ({
  onAssign({
    from,
    to,
    isUnassignAction
  }: any) {
    dispatch(assignOwnPapers({ from, to, isUnassignAction }));
  }
});

export default connect(stateToProps, dispatchToProps)(AssignOwnProfileAction);
