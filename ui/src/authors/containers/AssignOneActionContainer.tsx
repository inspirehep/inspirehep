import { connect } from 'react-redux';

import {
  setPublicationSelection,
  clearPublicationSelection,
  setAssignDrawerVisibility,
  assignPapers,
} from '../../actions/authors';
import AssignAction from '../components/AssignAction';

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    recordId
  }: any
) => ({
  onAssignToAnotherAuthor() {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(setAssignDrawerVisibility(true));
  },

  onAssign({
    from,
    to
  }: any) {
    dispatch(clearPublicationSelection());
    dispatch(setPublicationSelection([recordId], true));
    dispatch(assignPapers({ from, to }));
  }
});

export default connect(null, dispatchToProps)(AssignAction);
