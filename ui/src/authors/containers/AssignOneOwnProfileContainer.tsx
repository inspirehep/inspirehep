// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    recordId,
    disabledAssignAction
  }: $TSFixMe
) => ({
  onAssign({
    from,
    to,
    isUnassignAction
  }: $TSFixMe) {
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
  }
});

export default connect(null, dispatchToProps)(AssignOwnProfileAction);
