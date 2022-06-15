import { connect } from 'react-redux';

import AssignAction from '../components/AssignAction';
import { setAssignDrawerVisibility, assignPapers } from '../../actions/authors';

const stateToProps = (state: any) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  numberOfSelected: state.authors.get('publicationSelection').size,
  claimingTooltip: 'All selected papers are already claimed'
});

const dispatchToProps = (dispatch: any) => ({
  onAssignToAnotherAuthor() {
    dispatch(setAssignDrawerVisibility(true));
  },

  onAssign({
    from,
    to
  }: any) {
    dispatch(assignPapers({ from, to }));
  }
});

export default connect(stateToProps, dispatchToProps)(AssignAction);
