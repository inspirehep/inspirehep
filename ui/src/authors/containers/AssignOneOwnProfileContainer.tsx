import { connect } from 'react-redux';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  clearPublicationSelection,
  clearPublicationsClaimedSelection,
  assignOwnPapers,
  clearPublicationsUnclaimedSelection,
} from '../../actions/authors';
import AssignOwnProfileAction from '../components/AssignOwnProfileAction';

export const dispatchToProps = (
  dispatch,
  { recordId, disabledAssignAction }
) => ({
  onAssign({ from, to, isUnassignAction }) {
    dispatch(clearPublicationSelection());
    dispatch(clearPublicationsClaimedSelection());
    dispatch(clearPublicationsUnclaimedSelection());
    dispatch(setPublicationSelection([recordId], true));
    if (disabledAssignAction) {
      dispatch(setPublicationsClaimedSelection([recordId], true));
    } else {
      dispatch(setPublicationsUnclaimedSelection([recordId], true));
    }
    dispatch(assignOwnPapers({ from, to, isUnassignAction }));
  },
});

export default connect(null, dispatchToProps)(AssignOwnProfileAction);
