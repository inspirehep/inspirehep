import { connect } from 'react-redux';

import ToolAction from '../components/ToolAction';
import {
  setAssignDrawerVisibility,
  exportToCds,
} from '../../actions/literature';

import { MAX_BULK_ASSIGN } from '../constants';

const stateToProps = (state) => {
  const literatureSelectionSize = state.literature.get('literatureSelection')
    .size;
  return {
    selectionSize: literatureSelectionSize,
    disabledBulkAssign:
      literatureSelectionSize === 0 ||
      literatureSelectionSize > MAX_BULK_ASSIGN,
  };
};

const dispatchToProps = (dispatch) => ({
  onAssignToConference() {
    dispatch(setAssignDrawerVisibility(true));
  },
  onExportToCds() {
    dispatch(exportToCds());
  },
});

export default connect(stateToProps, dispatchToProps)(ToolAction);
