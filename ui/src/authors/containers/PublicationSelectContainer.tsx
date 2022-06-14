// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import PublicationsSelect from '../components/PublicationsSelect';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
} from '../../actions/authors';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    recordId
  }: any
) => ({
  checked: state.authors.get('publicationSelection').has(recordId)
});

const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    recordId
  }: any
) => ({
  onSelectPapersUserCanNotClaim(event: any) {
    dispatch(
      setPublicationsCanNotClaimSelection([recordId], event.target.checked)
    );
  },

  onSelectClaimedPapers(event: any) {
    dispatch(setPublicationsClaimedSelection([recordId], event.target.checked));
  },

  onSelectUnclaimedPapers(event: any) {
    dispatch(
      setPublicationsUnclaimedSelection([recordId], event.target.checked)
    );
  },

  onSelectPapers(event: any) {
    dispatch(setPublicationSelection([recordId], event.target.checked));
  }
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelect);
