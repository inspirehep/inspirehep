import { connect } from 'react-redux';

import ToolAction from '../components/ToolAction';
import { setAssignDrawerVisibility } from '../../actions/literature';

import { MAX_ASSIGN_RECORDS_TO_CONFERENCE } from '../constants';

const stateToProps = (state) => {
  const literatureSelectionSize = state.literature.get('literatureSelection')
    .size;
  return {
    disabledAssignConference:
      literatureSelectionSize === 0 ||
      literatureSelectionSize > MAX_ASSIGN_RECORDS_TO_CONFERENCE,
  };
};

const dispatchToProps = (dispatch) => ({
  onAssignToConference() {
    dispatch(setAssignDrawerVisibility(true));
  },
});

export default connect(stateToProps, dispatchToProps)(ToolAction);
